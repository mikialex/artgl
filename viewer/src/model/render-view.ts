import { RenderEngine } from '../../../src/artgl';

export class RenderView{
  compiledPrograms: number = 0;
  programSwitchCount: number = 0;
  uniformUpload: number = 0;
  drawcall: number = 0;

  faceDraw: number = 0;
  vertexDraw: number = 0;

  static create(engine: RenderEngine) {
    const renderer = engine.renderer;
    const view = new RenderView;
    view.compiledPrograms = renderer.programManager.compiledProgramsCount;
    view.updateFrameInfo(engine);
    return view;
  }

  updateFrameInfo(engine: RenderEngine) {
    this.programSwitchCount = engine.renderer.stat.programSwitch;
    this.uniformUpload = engine.renderer.stat.uniformUpload;
    this.drawcall = engine.renderer.stat.drawcall;
    this.faceDraw = engine.renderer.stat.faceDraw;
    this.vertexDraw = engine.renderer.stat.vertexDraw;
  }
}