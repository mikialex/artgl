import { GLInfo } from "../webgl/gl-info";
import { GLProgram, GLProgramConfig } from "../webgl/program";
import { Matrix4 } from "../math";
import { GLProgramManager } from "../webgl/program-manager";

export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    this.gl = el.getContext('webgl', options);
    this.el = el;
    this.width = this.el.width;
    this.height = this.el.height;
    this.glInfo = new GLInfo(this);
    this.glInfo.createAllExtension();
    this.devicePixelRatio = window.devicePixelRatio;
  }
  gl: WebGLRenderingContext;
  el: HTMLCanvasElement;

  devicePixelRatio = 1;
  projectionMatrix = new Matrix4();
  glInfo: GLInfo;

  private width = 100;
  private height = 100;
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private activeProgram: GLProgram;
  private programManager = new GLProgramManager(this);
  createProgram(conf: GLProgramConfig) {
    const program = new GLProgram(this, conf);
    this.programManager.addNewProgram(program);
  }

  getProgram() {
    
  }

  addProgram(program: GLProgram) {
    this.programManager.addNewProgram(program);
  }

  useProgram(program: GLProgram) {
    this.activeProgram = program;
  }

  render() {
    this.gl.drawArrays(this.gl.TRIANGLES, this.activeProgram.drawFrom, this.activeProgram.drawCount);
    console.log('render')
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  
}
