import {
  RenderGraph, Technique, TAAShading,
  TSSAOShading, TSSAOBlendShading, Matrix4, InnerSupportUniform, DepthShading, Scene, ARTEngine
} from "../../src/artgl";

export class RenderPipeline{

  graph: RenderGraph = new RenderGraph();

  enableTAA = true;
  taaTech: Technique = new Technique(new TAAShading());

  enableTSSAO = true;
  tssaoTech: Technique = new Technique(new TSSAOShading());

  composeTech: Technique = new Technique(new TSSAOBlendShading());
  depthTech = new Technique(new DepthShading());

  sampleCount: number = 0;

  private tickNum = 0;
  get isEvenTick() {
    return this.tickNum % 2 === 0;
  }

  render(engine: ARTEngine, scene: Scene) {
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
    this.graph.update(engine);
    this.graph.render(engine);
    // }
  }

  build(engine: ARTEngine, scene: Scene) {
    this.graph.setGraph({
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
          technique: this.depthTech,
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
          technique: this.taaTech,
          source: [RenderGraph.quadSource],
          enableColorClear: false,
          beforePassExecute: () => {
            engine.unJit();
            const VPInv: Matrix4 = this.taaTech.uniforms.get('VPMatrixInverse').value;
            const VP: Matrix4 = engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
            VPInv.getInverse(VP, true);
            this.taaTech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
            this.taaTech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
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
          technique: this.tssaoTech,
          source: [RenderGraph.quadSource],
          enableColorClear: false,
          beforePassExecute: () => {
            const VPInv: Matrix4 = this.tssaoTech.uniforms.get('VPMatrixInverse').value;
            const VP: Matrix4 = engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
            VPInv.getInverse(VP, true);
            this.tssaoTech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
            this.tssaoTech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
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
            this.composeTech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
          },
          afterPassExecute: () => {
            this.sampleCount++;
          },
          technique: this.composeTech,
          source: [RenderGraph.quadSource],
        },
      ]
    })
  }
}
