import {
  RenderGraph, TAAShading, screen,
  TSSAOShading, TSSAOBlendShading, Matrix4,
  DepthShading, Scene, RenderEngine, Shading, ProgressiveDof, pass, pingpong, target
} from "../../src/artgl";
import { EffectComposer } from '../../src/render-graph/effect-composer';
import { RenderConfig } from './components/conf/interface';

export class RenderPipeline{
  constructor(engine: RenderEngine) {
    this.engine = engine;
    this.composer = new EffectComposer(engine);
  }
  engine: RenderEngine;
  config?: RenderConfig;

  graph: RenderGraph = new RenderGraph();
  composer: EffectComposer;

  enableTAA = true;
  taaShading = new TAAShading()
  taaShader: Shading = new Shading().decorate(this.taaShading);

  enableTSSAO = true;
  tssaoShading = new TSSAOShading();
  tssaoShader: Shading = new Shading().decorate(this.tssaoShading);

  composeShading = new TSSAOBlendShading()
  composeShader: Shading = new Shading().decorate(this.composeShading);
  dof = new ProgressiveDof();
  depthShader = new Shading().decorate(new DepthShading()).decorate(this.dof);

  enableGraphDebugging = false;

  private sampleCount: number = 0;
  getSampleCount() {
    return this.sampleCount;
  }

  resetSample() {
    this.sampleCount = 0;
  }

  private tickNum = 0;
  get isEvenTick() {
    return this.tickNum % 2 === 0;
  }

  getFramebufferByName(name: string) {
    const node = this.graph.getRenderTargetDependence(name)!;
    const fbo = this.composer.getFramebuffer(node);
    if (fbo === undefined) {
      console.warn(`fbo ${name} has been optimized, to make it available, set keep content always true in render target node config`)
    }
    return fbo;
  }

  render(scene: Scene) {
    this.tickNum++;

    if (this.sampleCount >= 2) {
      this.dof.updateSample();
    }

    this.engine.connectCamera();
    if (this.engine.isCameraChanged) {
      this.sampleCount = 0;
    } else {
      if (this.enableTAA) {
        this.engine.jitterProjectionMatrix();
      }
    }

    // if (this.sampleCount <= 100) {
    this.build(scene);
    this.graph.build(this.composer);
    this.composer.render(this.engine, this.enableGraphDebugging);
    // }
  }

  private build(scene: Scene) {

    // this.config = createConf(this.engine, this);

    this.tickNum++;
    
    const depthPass = pass("depthPass").use(scene.render)
    const scenePass = pass("scenePass")
      .use(scene.renderScene)
      .overrideShading(this.depthShader)
    
    const depthResult = target("depthResult").needDepth().from(depthPass)
    const sceneResult = target("sceneResult").needDepth().from(scenePass)
    
    const createTAA = ()=> {
      const taaHistory = pingpong("TAAHistory", this.tickNum)
      const taaPass = pass("taa").useQuad()
        .overrideShading(this.taaShader)
        .disableColorClear()
        .beforeExecute(() => {
          this.engine.unJit();
          const VP: Matrix4 = this.engine.globalUniforms.VPMatrix.value
          this.taaShading.VPMatrixInverse = this.taaShading.VPMatrixInverse.getInverse(VP, true); // TODO maybe add watch
          this.taaShading.sampleCount = this.sampleCount;
        })
        .input("sceneResult", sceneResult)
        .input("depthResult", depthResult)
        .input("TAAHistoryOld", taaHistory.ping())
      taaHistory.pong().from(taaPass)
      return taaHistory
    }
    
    const AAedScene = when(this.enableTAA, createTAA().pong(), sceneResult)

    const createTSSAO = () => {
      const TSSAOHistory = pingpong("TSSAOHistory", this.tickNum)
      const tssaoPass = pass("tssao").useQuad()
        .overrideShading(this.tssaoShader)
        .disableColorClear()
        .beforeExecute(() => {
          const VP: Matrix4 = this.engine.globalUniforms.VPMatrix.value
          this.tssaoShading.VPMatrixInverse = this.tssaoShading.VPMatrixInverse.getInverse(VP, true);
          this.tssaoShading.sampleCount = this.sampleCount;
        })
        .input("depthResult", depthResult)
        .input("AOAcc", TSSAOHistory.ping())
      TSSAOHistory.pong().from(tssaoPass)

      const tssaoCompose = pass("composeAll")
      .overrideShading(this.composeShader)
      .input("basic", AAedScene)
      .input("tssao", TSSAOHistory.pong())
      .beforeExecute(() => {
        this.composeShading.sampleCount = this.sampleCount;
      })
      .afterExecute(() => {
        this.composeShading.sampleCount = this.sampleCount;
      })
      .disableColorClear()

      return screen().from(tssaoCompose);
    }
  
    
    this.graph.setScreenRoot(
      when(this.enableTSSAO, createTSSAO(), AAedScene)
    )

  }
}

function when<Y, N>(condition: boolean, yes: Y, no: N) {
  return condition? yes: no
}



