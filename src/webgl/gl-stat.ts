export class GLStat{
  drawcall: number = 0;
  programSwitch: number = 0;
  uniformUpload: number = 0;
  framebufferSwitch: number = 0;

  faceDraw: number = 0;
  vertexDraw: number = 0;

  reset() {
    this.drawcall = 0;
    this.programSwitch = 0;
    this.uniformUpload = 0;
    this.framebufferSwitch = 0;
    this.faceDraw = 0;
    this.vertexDraw = 0;
  }
}