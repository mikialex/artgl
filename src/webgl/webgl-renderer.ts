import { GLInfo } from "./gl-info";
import { GLProgram, GLProgramConfig } from "./program";
import { Matrix4 } from "../math/index";
import { GLProgramManager } from "./program-manager";
import { GLAttributeBufferDataManager } from "./attribute-buffer-manager";
import { GLState } from "./states/gl-state";
import { DrawMode } from "./const";
import { Nullable } from "../type";
import { GLTextureManager } from "./texture-manager";
import { GLFrameBufferManager } from "./framebuffer-manager";
import { GLFramebuffer } from "./gl-framebuffer";

export class GLRenderer {
  constructor(el?: HTMLCanvasElement, options?: any) {
    if (el === undefined) {
      el = document.createElement('canvas');
    }
    options = { ...options };
    options.antialias = false;
    const ctx = el.getContext('webgl', options);
    if (ctx === null) {
      throw 'webgl context create failed';
    }
    this.gl = ctx;
    this.el = el;
    this._width = this.el.width;
    this._height = this.el.height;
    this.glInfo = new GLInfo(this);
    this.glInfo.createAllExtension();
    this.devicePixelRatio = window.devicePixelRatio;
    this.state = new GLState(this);
    this.textureManger.init();
  }
  gl: WebGLRenderingContext;
  el: HTMLCanvasElement;

  projectionMatrix = new Matrix4();
  glInfo: GLInfo;

  // enable this will cause great performance issue
  // only enable this when debug draw range issue
  enableRenderErrorCatch: boolean = false;

  private _width = 100;
  get width() { return this._width };
  private _height = 100;
  get height() { return this._height };

  devicePixelRatio = window.devicePixelRatio;

  setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.el.width = this._width * this.devicePixelRatio;
    this.el.height = this._height * this.devicePixelRatio;
		this.state.setViewport( 0, 0, width * this.devicePixelRatio, height * this.devicePixelRatio );
  }

  state: GLState;
  activeProgram: Nullable<GLProgram> = null;
  readonly programManager = new GLProgramManager(this);
  readonly textureManger = new GLTextureManager(this);
  readonly attributeBufferManager = new GLAttributeBufferDataManager(this);
  readonly frambufferManager = new GLFrameBufferManager(this);

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

    if (this.enableRenderErrorCatch) {
      const errorCode = this.gl.getError();
      if ( errorCode !== this.gl.NO_ERROR) {
        throw `gl draw error: ${ errorCode }`;
      }
    }

    this.state.textureSlot.resetSlotIndex();
  }

  setRenderTarget(framebuffer: GLFramebuffer) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.wegbglFrameBuffer);
    gl.viewport(0, 0, framebuffer.width, framebuffer.height);
  }
  setRenderTargetScreen() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this._width, this._height);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  dispose() {
    this.attributeBufferManager.dispose();
    this.programManager.dispose();
  }
  
}
