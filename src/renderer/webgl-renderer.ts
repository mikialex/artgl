import { GLInfo } from "../webgl/gl-info";
import { GLProgram, GLProgramConfig } from "../webgl/program";
import { Matrix4 } from "../math";
import { GLProgramManager } from "../webgl/program-manager";
import { GLAttributeBufferDataManager } from "../webgl/attribute-buffer-manager";
import { GLState } from "../webgl/gl-state";

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

  projectionMatrix = new Matrix4();
  glInfo: GLInfo;

  width = 100;
  height = 100;
  devicePixelRatio = 1;
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.el.width = this.width * this.devicePixelRatio;
    this.el.height = this.height * this.devicePixelRatio;
		this.state.viewport( 0, 0, width, height );
  }

  state: GLState = new GLState(this);
  private activeProgram: GLProgram;
  private programManager = new GLProgramManager(this);
  private attributeBufferManager = new GLAttributeBufferDataManager(this);
  createProgram(conf: GLProgramConfig): GLProgram {
    const program = new GLProgram(this, conf);
    this.programManager.addNewProgram(program);
    return program;
  }

  getProgram(storeId: string): GLProgram {
    return this.programManager.getProgram(storeId);
  }

  addProgram(program: GLProgram) {
    this.programManager.addNewProgram(program);
  }

  useProgram(program: GLProgram) {
    this.activeProgram = program;
  }

  
  createBuffer(data: ArrayBuffer): WebGLBuffer {
    const id = this.attributeBufferManager.createBuffer(data);
    return this.attributeBufferManager.getGLBuffer(id);
  }

  getBuffer(storeId: string) {
    return this.attributeBufferManager.getGLBuffer(storeId);
  }

  deleteBuffer(storeId: string) {
    this.attributeBufferManager.disposeBuffer(storeId);
  }

  render() {
    this.gl.drawArrays(this.gl.TRIANGLES, this.activeProgram.drawFrom, this.activeProgram.drawCount);
    console.log('render')
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  dispose() {
    this.attributeBufferManager.dispose();
    this.programManager.dispose();
  }
  
}
