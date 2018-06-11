import { GLInfo } from "../webgl/gl-info";
import { GLProgram } from "../webgl/webgl-program";
import { Matrix4, Vector3 } from "../math";
import { Attribute } from "../core/attribute";

type uniformValueType = number | Matrix4 | Vector3;

export interface UniformGroup{
  [index: string]: uniformValueType;
}

export interface AttributesGroup {
  [index: string]: Attribute;
}

export interface GLRenderable{
  uniforms: UniformGroup;
  attributs: AttributesGroup;
  program: GLProgram;
}

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
  private programs: GLProgram[] = [];
  addProgram(program: GLProgram) {
    this.programs.push(program);
  }
  useProgram(program: GLProgram) {
    this.activeProgram = program;
  }

  render() {
    this.gl.drawArrays(this.gl.TRIANGLES, this.activeProgram.drawFrom, this.activeProgram.drawCount);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  
}
