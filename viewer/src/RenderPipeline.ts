import {
  RenderGraph, TAAShading,
  TSSAOShading, TSSAOBlendShading, Matrix4,
  InnerSupportUniform, DepthShading, Scene, RenderEngine, Shading
} from "../../src/artgl";
import { EffectComposer } from '../../src/render-graph/render-graph';
import { RenderConfig } from './components/conf/interface';
import { createConf } from './conf';

export class RenderPipeline{
  config: RenderConfig

  graph: RenderGraph = new RenderGraph();
  composer: EffectComposer = new EffectComposer();

  enableTAA = true;
  taaShading = new TAAShading()
  taaShader: Shading = new Shading().decorate(this.taaShading);

  enableTSSAO = true;
  tssaoShading = new TSSAOShading();
  tssaoShader: Shading = new Shading().decorate(this.tssaoShading);

  composeShading = new TSSAOBlendShading()
  composeShader: Shading = new Shading().decorate(this.composeShading);
  depthShader = new Shading().decorate(new DepthShading());

  private sampleCount: number = 0;

  resetSample() {
    this.sampleCount = 0;
  }

  private tickNum = 0;
  get isEvenTick() {
    return this.tickNum % 2 === 0;
  }

  render(engine: RenderEngine, scene: Scene) {
    this.tickNum++;

    engine.connectCamera();
    if (engine.isCameraChanged || scene.isFrameChange) {
      this.sampleCount = 0;
    } else {
      if (this.enableTAA) {
        engine.jitterProjectionMatrix();
      }
    }

    // if (this.sampleCount <= 100) {
    this.graph.update(engine, this.composer);
    this.composer.render(engine, this.graph);
    // }
  }

  build(engine: RenderEngine, scene: Scene) {
    this.config = createConf(engine, this);
    this.graph.defineGraph(
      this.composer,
      {
      renderTargets: [
        {
          name: RenderGraph.screenRoot,
          from: () => 'CopyToScreen',
        },
        {
          name: 'sceneResult',
          from: () => 'SceneOrigin',
        },
        {
          name: 'depthResult',
          from: () => 'Depth',
        },
        {
          name: 'TAAHistoryA',
          from: () => this.isEvenTick ? null : 'TAA',
        },
        {
          name: 'TAAHistoryB',
          from: () => this.isEvenTick ? 'TAA' : null,
        },
        {
          name: 'TSSAOHistoryA',
          from: () => this.isEvenTick ? null : 'TSSAO',
        },
        {
          name: 'TSSAOHistoryB',
          from: () => this.isEvenTick ? 'TSSAO' : null,
        },
      ],
      passes: [
        { // general scene origin
          name: "SceneOrigin",
          source: [scene],
        },
        { // depth
          name: "Depth",
          shading: this.depthShader,
          source: [scene],
        },
        { // mix new render and old samples
          name: "TAA",
          inputs: () => {
            return {
              sceneResult: "sceneResult",
              depthResult: "depthResult",
              TAAHistoryOld: this.isEvenTick ? "TAAHistoryA" : "TAAHistoryB",
            }
          },
          shading: this.taaShader,
          source: [RenderGraph.quadSource],
          enableColorClear: false,
          beforePassExecute: () => {
            engine.unJit();
            const VP: Matrix4 = engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
            this.taaShading.VPMatrixInverse = this.taaShading.VPMatrixInverse.getInverse(VP, true); // TODO maybe add watch
            this.taaShading.sampleCount = this.sampleCount;
          },
        },
        {
          name: "TSSAO",
          inputs: () => {
            return {
              depthResult: "depthResult",
              AOAcc: this.isEvenTick ? "TSSAOHistoryA" : "TSSAOHistoryB",
            }
          },
          shading: this.tssaoShader,
          source: [RenderGraph.quadSource],
          enableColorClear: false,
          beforePassExecute: () => {
            const VP: Matrix4 = engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
            this.tssaoShading.VPMatrixInverse = this.tssaoShading.VPMatrixInverse.getInverse(VP, true);
            this.tssaoShading.sampleCount = this.sampleCount;
          },
        },
        { // copy to screen
          name: "CopyToScreen",
          enableColorClear: false,
          inputs: () => {
            let basic: string;
            let tssao: string;
            if (this.enableTAA) {
              basic = this.isEvenTick ? "TAAHistoryB" : "TAAHistoryA"
            } else {
              basic = "sceneResult"
            }
            if (this.enableTSSAO) {
              tssao = this.isEvenTick ? "TSSAOHistoryB" : "TSSAOHistoryA"
            } else {
              tssao = "sceneResult" // TODO consider design a way to bind default empty source? or recompile shader?
            }
            return { basic, tssao }
          },
          beforePassExecute: () => {
            this.composeShading.sampleCount = this.sampleCount;
          },
          afterPassExecute: () => {
            this.sampleCount++;``
          },
          shading: this.composeShader,
          source: [RenderGraph.quadSource],
        },
      ]
    })
  }
}
