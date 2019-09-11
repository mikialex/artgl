import {
  RenderGraph, TAAShading, screen,
  TSSAOShading, TSSAOBlendShading, Matrix4,
  DepthShading, Scene, RenderEngine, Shading, ProgressiveDof, pass, pingpong, target, when, PingPongTarget
} from "../../src/artgl";
import { EffectComposer } from '../../src/render-graph/effect-composer';
import { RenderConfig } from './components/conf/interface';
import { createConf } from './conf';

export class AdvanceStaticRenderPipeline {
  constructor(engine: RenderEngine) {
    this.engine = engine;
    this.composer = new EffectComposer(engine);
    this.config = createConf(this.engine, this);
  }
  engine: RenderEngine;
  config: RenderConfig;

  graph: RenderGraph = new RenderGraph();
  composer: EffectComposer;

  enableTAA = true;
  taaShading = new TAAShading()
  taaShader: Shading = new Shading().decorate(this.taaShading);
  taaHistory: PingPongTarget = pingpong('taa');

  enableTSSAO = true;
  tssaoShading = new TSSAOShading();
  tssaoShader: Shading = new Shading().decorate(this.tssaoShading);
  tssaoHistory: PingPongTarget = pingpong('tssao');

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

  updateTicks() {
    this.taaHistory.tick();
    this.tssaoHistory.tick();

  }

  getFramebufferByName(name: string) {
    // const node = this.graph.getRenderTargetDependence(name)!;
    // const fbo = this.composer.getFramebuffer(node);
    // if (fbo === undefined) {
    //   console.warn(`fbo ${name} has been optimized, to make it available, set keep content always true in render target node config`)
    // }
    // return fbo;
  }

  render(scene: Scene) {
    this.updateTicks();

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

    const depthPass = pass("depthPass").use(scene.render)
    const scenePass = pass("scenePass")
      .use(scene.renderScene)
      .overrideShading(this.depthShader)

    const depthResult = target("depthResult").needDepth().from(depthPass)
    const sceneResult = target("sceneResult").needDepth().from(scenePass)

    const createTAA = () => {
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
        .input("TAAHistoryOld", this.taaHistory.ping())

      return this.taaHistory.pong().from(taaPass)
    }

    const AAedScene = when(this.enableTAA, createTAA(), sceneResult)

    const createTSSAO = () => {
      const tssaoPass = pass("tssao").useQuad()
        .overrideShading(this.tssaoShader)
        .disableColorClear()
        .beforeExecute(() => {
          const VP: Matrix4 = this.engine.globalUniforms.VPMatrix.value
          this.tssaoShading.VPMatrixInverse = this.tssaoShading.VPMatrixInverse.getInverse(VP, true);
          this.tssaoShading.sampleCount = this.sampleCount;
        })
        .input("depthResult", depthResult)
        .input("AOAcc", this.tssaoHistory.ping())

      const tssaoCompose = pass("composeAll")
        .overrideShading(this.composeShader)
        .input("basic", AAedScene)
        .input("tssao", this.tssaoHistory.pong().from(tssaoPass))
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



