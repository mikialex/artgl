import { RenderEngine } from '../../../src/artgl';

export class RenderView{
  compiledPrograms: number;
  programSwitchCount: number;
  uniformUpload: number;
  drawcall: number;

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
  }
}