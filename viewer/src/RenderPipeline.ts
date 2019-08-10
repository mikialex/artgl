import {
  RenderGraph, TAAShading,
  TSSAOShading, TSSAOBlendShading, Matrix4,
  InnerSupportUniform, DepthShading, Scene, RenderEngine, Shading
} from "../../src/artgl";
import { EffectComposer } from '../../src/render-graph/effect-composer';
import { RenderConfig } from './components/conf/interface';
import { createConf } from './conf';

export class RenderPipeline{
  constructor(engine: RenderEngine) {
    this.engine = engine;
    this.composer = new EffectComposer(engine);
  }
  engine: RenderEngine;
  config: RenderConfig;

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
  depthShader = new Shading().decorate(new DepthShading());

  private sampleCount: number = 0;

  resetSample() {
    this.sampleCount = 0;
  }

  private tickNum = 0;
  get isEvenTick() {
    return this.tickNum % 2 === 0;
  }

  render(scene: Scene) {
    this.tickNum++;

    this.engine.connectCamera();
    if (this.engine.isCameraChanged || scene.isFrameChange) {
      this.sampleCount = 0;
    } else {
      if (this.enableTAA) {
        this.engine.jitterProjectionMatrix();
      }
    }

    // if (this.sampleCount <= 100) {
    this.graph.update(this.engine, this.composer);
    this.composer.render(this.engine, this.graph);
    // }
  }

  build(scene: Scene) {
    this.config = createConf(this.engine, this);
    this.graph.defineGraph(
      {
      renderTargets: [
        {
          name: RenderGraph.screenRoot,
          from: () => 'CopyToScreen',
        },
        {
          name: 'sceneResult',
          format: {
            enableDepthBuffer: true,
          },
          from: () => 'SceneOrigin',
        },
        {
          name: 'depthResult',
          format: {
            enableDepthBuffer: true,
          },
          from: () => 'Depth',
        },
        {
          name: 'TAAHistoryA',
          keepContent: () => !this.isEvenTick,
          from: () => this.isEvenTick ? null : 'TAA',
        },
        {
          name: 'TAAHistoryB',
          keepContent: () => this.isEvenTick,
          from: () => this.isEvenTick ? 'TAA' : null,
        },
        {
          name: 'TSSAOHistoryA',
          keepContent: () => !this.isEvenTick,
          from: () => this.isEvenTick ? null : 'TSSAO',
        },
        {
          name: 'TSSAOHistoryB',
          keepContent: () => this.isEvenTick,
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
            this.engine.unJit();
            const VP: Matrix4 = this.engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
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
            const VP: Matrix4 = this.engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
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
