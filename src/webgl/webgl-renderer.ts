import { GLInfo } from "./gl-info";
import { GLProgram, GLProgramConfig } from "./program";
import { Matrix4 } from "../math/index";
import { GLProgramManager } from "./program-manager";
import { GLAttributeBufferDataManager } from "./attribute-buffer-manager";
import { GLState } from "./states/gl-state";
import { DrawMode } from "./const";
import { Nullable } from "../type";
import { GLTextureManager } from "./texture-manager";

export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    const ctx = el.getContext('webgl', options);
    if (ctx === null) {
      throw 'webgl context create failed';
    }
    this.gl = ctx;
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
		this.state.setViewport( 0, 0, width * this.devicePixelRatio, height * this.devicePixelRatio );
  }

  state: GLState = new GLState(this);
  activeProgram: Nullable<GLProgram> = null;
  readonly programManager = new GLProgramManager(this);
  readonly textureManger = new GLTextureManager(this);
  readonly attributeBufferManager = new GLAttributeBufferDataManager(this);
  createProgram(conf: GLProgramConfig): GLProgram {
    const program = new GLProgram(this, conf);
    this.programManager.addNewProgram(program);
    return program;
  }

  getProgram(storeId: string): GLProgram {
    return this.programManager.getProgram(storeId);
  }

  useProgram(program: GLProgram) {
    if (this.activeProgram !== program) {
      this.activeProgram = program;
      this.gl.useProgram(program.getProgram());
    }
  }

  getGLTexture(storeId: string) {
    return this.textureManger.getGLTexture(storeId);
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
    if (this.activeProgram === null) {
      throw 'renderer hasnt active program'
    }
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
