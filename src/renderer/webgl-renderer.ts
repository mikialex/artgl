import { GLInfo } from "../webgl/gl-info";
import { GLProgram, GLProgramConfig } from "../webgl/program";
import { Matrix4 } from "../math";
import { GLProgramManager } from "../webgl/program-manager";
import { GLAttributeBufferDataManager } from "../webgl/attribute-buffer-manager";
import { GLState } from "../webgl/gl-state";
import { DrawMode } from "../webgl/const";

export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    this.gl = el.getContext('webgl', options);
    this.el = el;
    this.width = this.el.width;
    this.height = this.el.height;
    this.glInfo = new GLInfo(this);
    this.glInfo.createAllExtension();
    this.devicePixelRatio = window.devicePixelRatio;
    this.state = new GLState(this);
    this.gl.enable(this.gl.DEPTH_TEST);
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
    this.el.style.width = width + 'px';
    this.el.style.height = height + 'px';
		this.state.viewport( 0, 0, width * this.devicePixelRatio, height * this.devicePixelRatio );
  }

  state: GLState = new GLState(this);
  activeProgram: GLProgram;
  programManager = new GLProgramManager(this);
  attributeBufferManager = new GLAttributeBufferDataManager(this);
  createProgram(conf: GLProgramConfig): GLProgram {
    const program = new GLProgram(this, conf);
    this.programManager.addNewProgram(program);
    return program;
  }

  getProgram(storeId: string): GLProgram {
    return this.programManager.getProgram(storeId);
  }

  useProgram(program: GLProgram) {
    this.activeProgram = program;
    this.gl.useProgram(program.getProgram());
  }

  
  createBuffer(data: ArrayBuffer, useforIndex: boolean): string {
    return this.attributeBufferManager.createBuffer(data, useforIndex);
  }

  getBuffer(storeId: string) {
    return this.attributeBufferManager.getGLBuffer(storeId);
  }

  deleteBuffer(storeId: string) {
    this.attributeBufferManager.disposeBuffer(storeId);
  }

  render(mode: DrawMode, useIndex: boolean) {
    if (useIndex) {
      this.gl.drawElements(
        mode,
        this.activeProgram.drawCount,
        this.gl.UNSIGNED_SHORT,
        0
      );
    } else {
      this.gl.drawArrays(mode, this.activeProgram.drawFrom, this.activeProgram.drawCount);
    }
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  dispose() {
    this.attributeBufferManager.dispose();
    this.programManager.dispose();
  }
  
}
