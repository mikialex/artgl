import { GLInfo, GLExtList } from "./gl-info";
import { GLProgram, GLProgramConfig } from "./program";
import { GLProgramManager } from "./program-manager";
import { GLAttributeBufferDataManager } from "./attribute-buffer-manager";
import { GLState } from "./states/gl-state";
import { DrawMode } from "./const";
import { Nullable, GLReleasable } from "../type";
import { GLTextureManager } from "./texture-manager";
import { GLFrameBufferManager } from "./framebuffer-manager";
import { GLFramebuffer } from "./gl-framebuffer";
import { GLStat } from "./gl-stat";
import { GLVAOManager } from "./vao";

export class GLRenderer implements GLReleasable {
  constructor(el?: HTMLCanvasElement, options?: any) {
    if (el === undefined) {
      el = document.createElement('canvas');
    }
    options = { ...options };
    options.antialias = false;
    // options.preserveDrawingBuffer = true; // for screen shot
    const ctx = el.getContext('webgl', options);
    if (ctx === null) {
      throw 'webgl context create failed';
    }
    this.gl = ctx;
    this.el = el;
    this.glInfo = new GLInfo(ctx);
    this.framebufferManager = new GLFrameBufferManager(this);
    this.vaoManager = new GLVAOManager(this);
    this.state = new GLState(this);
    this.textureManger.init();

    const ext = this.glInfo.getExtension(GLExtList.ANGLE_instanced_arrays);
    if (ext !== undefined) {
      this.angleInstanceExt = ext;
    }

    this.setSize(this.el.offsetWidth, this.el.offsetHeight);
  }
  readonly gl: WebGLRenderingContext;
  readonly el: HTMLCanvasElement;

  readonly glInfo: GLInfo;
  private angleInstanceExt: Nullable<ANGLE_instanced_arrays> = null;

  // enable this will cause great performance issue
  // only enable this when debug draw range issue
  enableRenderErrorCatch: boolean = false;
  enableUniformDiff: boolean = true;

  // width height is render size, not element size
  private _width = 100;
  get width() { return this._width };
  private _height = 100;
  get height() { return this._height };

  private devicePixelRatio = window.devicePixelRatio;

  // set render size by device logic size
  setSize(width: number, height: number): boolean {
    return this.setRawRenderSize(width * this.devicePixelRatio, height * this.devicePixelRatio);
  }
  setRawRenderSize(width: number, height: number): boolean {
    let isChanged = this._width !== width || this._height !== height;
    this._width = width;
    this._height = height;
    this.el.width = this._width;
    this.el.height = this._height;
    this.state.setViewport(0, 0, width, height);
    return isChanged;
  }

  readonly state: GLState;
  readonly stat: GLStat = new GLStat();
  private activeProgram: Nullable<GLProgram> = null;
  _programChangeId: number = 0;

  // resource managers
  readonly programManager = new GLProgramManager();
  readonly textureManger = new GLTextureManager(this);
  readonly attributeBufferManager = new GLAttributeBufferDataManager(this);
  readonly vaoManager: GLVAOManager;
  readonly framebufferManager: GLFrameBufferManager;

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
      this.stat.programSwitch++;
      this.activeProgram = program;
      this._programChangeId++;
      this.gl.useProgram(program.getProgram());
    }
  }

  draw(mode: DrawMode) {
    const program = this.activeProgram;
    if (program === null) {
      throw 'renderer hasn\'t active program'
    }

    if (!program.useInstance) {
      if (program.useIndexDraw) {
        this.gl.drawElements(
          mode,
          program.drawCount,
          program._indexUINT ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT,
          program.drawFrom
        );
      } else {
        this.gl.drawArrays(mode, program.drawFrom, program.drawCount);
      }
    } else {
      if (this.angleInstanceExt === null) {
        throw 'instance not support'
      }
      if (program.useIndexDraw) {
        // https://developer.mozilla.org/en-US/docs/Web/API/ANGLE_instanced_arrays/drawElementsInstancedANGLE
        this.angleInstanceExt.drawElementsInstancedANGLE(
          mode,
          program.drawCount,
          program._indexUINT ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT,
          program.drawFrom,
          program.instanceCount);
      } else {
        // https://developer.mozilla.org/en-US/docs/Web/API/ANGLE_instanced_arrays/drawArraysInstancedANGLE
        this.angleInstanceExt.drawArraysInstancedANGLE(
          mode,
          program.drawFrom,
          program.drawCount,
          program.instanceCount);
      }
    }

    if (this.enableRenderErrorCatch) {
      this.checkGLError();
    }

    this.state.textureSlot.resetSlotIndex();

    // update draw stat // TODO support other draw type
    this.stat.drawcall++;
    if (mode === DrawMode.TRIANGLES) {
      this.stat.faceDraw += (program.drawCount / 3 * program.instanceCount)
      this.stat.vertexDraw += (program.drawCount * program.instanceCount)
    }
  }

  checkGLError() {
    const errorCode = this.gl.getError();
    if (errorCode !== this.gl.NO_ERROR) {
      // debugger
      throw `gl draw error: ${errorCode}`;
    }
  }

  currentFramebuffer: Nullable<GLFramebuffer> = null;
  setRenderTarget(framebuffer: Nullable<GLFramebuffer>) {
    if (this.currentFramebuffer !== framebuffer) {
      this.stat.framebufferSwitch++;
      this.currentFramebuffer = framebuffer;
      const gl = this.gl;
      if (framebuffer === null) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.webglFrameBuffer);
      }
    }
  }

  setRenderTargetScreen() {
    this.setRenderTarget(null);
  }

  releaseGL() {
    this.attributeBufferManager.releaseGL();
    this.programManager.releaseGL();
    this.textureManger.releaseGL();
    this.framebufferManager.releaseGL();
    this.vaoManager.releaseGL();
  }

}
