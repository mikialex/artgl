import {
  RenderGraph, TAAShading, screen,
  TSSAOShading, TSSAOBlendShading, Matrix4,
  DepthShading, Scene, RenderEngine, Shading, ProgressiveDof,
  pass, pingpong, target, when, PingPongTarget, Texture
} from "../../src/artgl";
import { EffectComposer } from '../../src/render-graph/effect-composer';
import { RenderConfig } from './components/conf/interface';
import { createConf } from './conf';
import { CopyShading } from '../../src/shading/pass-lib/copy';
import { Nullable } from '../../src/type';
import { DirectionalShadowMap } from '../../src/shadow-map/directional-shadowmap';

const copier = new Shading().decorate(new CopyShading())

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

  _enableTAA = true;
  get enableTAA() { return this._enableTAA }
  set enableTAA(value) {
    this.resetSample();
    this._enableTAA = value;
  }
  taaShading = new TAAShading()
  taaShader: Shading = new Shading().decorate(this.taaShading);
  taaHistory: PingPongTarget = pingpong('taa');

  _enableTSSAO = true;
  
  get enableTSSAO() { return this._enableTSSAO }
  set enableTSSAO(value) {
    this.resetSample();
    this._enableTSSAO = value;
  }
  tssaoShading = new TSSAOShading();
  tssaoShader: Shading = new Shading().decorate(this.tssaoShading);
  tssaoHistory: PingPongTarget = pingpong('tssao');

  composeShading = new TSSAOBlendShading()
  composeShader: Shading = new Shading().decorate(this.composeShading);
  dof = new ProgressiveDof();
  depthShader = new Shading().decorate(new DepthShading()).decorate(this.dof);

  enableGraphDebugging = false;

  sceneShading: Nullable<Shading> = null;

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

    if (this.sampleCount >= 2) {
      if (!this._enableTAA) {
        this.dof.blurRadius = 0;
      }
      this.dof.updateSample();
    }

    this.engine.connectCamera();
    if (this.engine.isCameraChanged) {
      this.sampleCount = 0;
    } else {
      if (this._enableTAA) {
        this.engine.jitterProjectionMatrix();
      }
    }

    // if (this.sampleCount <= 100) {
    this.build(scene);
    this.graph.build(this.composer);
    this.composer.render(this.engine, this.enableGraphDebugging);
    this.sampleCount++;
    // }
  }

  directionalShadowMap = target("directionalShadowMap").needDepth()
  .afterContentReceived(node => {
    const shadowMapTextureFBOKey = this.composer.getFramebuffer(node)!.name
    if (this.sceneShading !== null) {
      this.sceneShading.defineFBOInput(shadowMapTextureFBOKey, 'directionalShadowMapTexture')
    }
  })

  private build(scene: Scene) {
    this.updateTicks();

    const directionalShadowMapPass = pass("directionalShadowMapPass")
      .use(scene.renderScene).overrideShading(this.depthShader)
    
    this.directionalShadowMap.from(directionalShadowMapPass)
    
    const depthPass = pass("depthPass").use(scene.renderScene)
      .overrideShading(this.depthShader)

    const scenePass = pass("scenePass")
      .use(scene.render)
      .depend(this.directionalShadowMap)

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

      return taaPass
    }

    const AAedScene = when(this._enableTAA, this.taaHistory.pong().from(createTAA()), sceneResult)

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

      const tssaoCompose = pass("composeAll").useQuad()
        .overrideShading(this.composeShader)
        .input("basic", AAedScene)
        .input("tssao", this.tssaoHistory.pong().from(tssaoPass))
        .beforeExecute(() => {
          this.composeShading.sampleCount = this.sampleCount;
        })
        .disableColorClear()

      return tssaoCompose;
    }

    this.graph.setScreenRoot(
      screen().from(
        when(
          this._enableTSSAO,
          createTSSAO(),
          pass("copy").useQuad().overrideShading(copier)
            .input("copySource", AAedScene))
      )
    )

  }
}



