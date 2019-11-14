import {
  RenderGraph, TAAShading, screen,
  TSSAOShading, TSSAOBlendShading,
  DepthShading, Scene, RenderEngine, Shading, ProgressiveDof,
  pass, pingpong, target, when, PingPongTarget, PerspectiveCamera, RenderTargetNode,
} from "artgl";
import { EffectComposer } from 'artgl/src/render-graph/effect-composer';
import { RenderConfig } from './components/conf/interface';
import { createConf } from './conf';
import { CopyShading } from 'artgl/src/shading/pass-lib/copy';
import { Nullable } from 'artgl/src/type';
import { DirectionalShadowMap } from 'artgl/src/shadow-map/directional-shadowmap';

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
  depthShader = new Shading().decoCamera()
    .decorate(new DepthShading()).decorate(this.dof);

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

  render(scene: Scene, camera: PerspectiveCamera) {

    if (this.sampleCount >= 2) {
      if (!this._enableTAA) {
        this.dof.blurRadius = 0;
      }
      this.dof.updateSample();
    }

    if (camera.viewProjectionMatrixNeedUpdate) {
      this.sampleCount = 0;
    } else {
      if (this._enableTAA) {
        camera.jitter(this.engine.renderer.width, this.engine.renderer.height);
      }
    }

    // if (this.sampleCount <= 100) {
    this.build(scene, camera);
    this.graph.build(this.composer);
    this.engine.useCamera(camera);
    this.composer.render(this.engine, this.enableGraphDebugging);
    this.sampleCount++;
    // }
  }

  directionalShadowMap!: DirectionalShadowMap

  directionalShadowMapTarget: RenderTargetNode =target("directionalShadowMap").needDepth()
  .afterContentReceived(node => {
    const shadowMapTextureFBOKey = this.composer.getFramebuffer(node)!.name
    if (this.sceneShading !== null) {
      this.sceneShading.defineFBOInput(shadowMapTextureFBOKey, 'directionalShadowMapTexture')
    }
  })

  private build(scene: Scene, camera: PerspectiveCamera) {
    this.updateTicks();

    // // draw the shadow map
    // const directionalShadowMapPass = pass("directionalShadowMapPass")
    //   .use(scene.renderScene)
    //   .overrideShading(this.depthShader)
    //   .beforeExecute(() => {
    //     this.depthShader.params.set(PerspectiveCameraInstance, this.directionalShadowMap.getShadowCamera())
    //   }).afterExecute(() => {
    //     this.depthShader.params.clear();
    // })
    
    // this.directionalShadowMapTarget = this.directionalShadowMapTarget
    //   .from(directionalShadowMapPass)
    
    const depthPass = pass("depthPass").use(scene.renderScene)
      .beforeExecute(() => {
        let a = 1;
    })
      .overrideShading(this.depthShader)

    const scenePass = pass("scenePass")
      .use(scene.render)
      // .depend(this.directionalShadowMapTarget)

    const depthResult = target("depthResult").needDepth().from(depthPass)
    const sceneResult = target("sceneResult").needDepth().from(scenePass)

    const VP = camera.viewProjectionMatrix;
    const createTAA = () => {
      const taaPass = pass("taa").useQuad()
        .overrideShading(this.taaShader)
        .disableColorClear()
        .beforeExecute(() => {
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
          this.tssaoShading.VPMatrix = VP;
          this.tssaoShading.VPMatrixInverse = this.tssaoShading.VPMatrixInverse.getInverse(VP, true);// TODO maybe add watch
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

    // this.graph.setScreenRoot(
    //   screen().from(
    //     when(
    //       false, 
    //       createTSSAO(),
    //       pass("copy").useQuad().overrideShading(copier)
    //         .input("copySource", sceneResult))
    //   )
    // )

  }
}



