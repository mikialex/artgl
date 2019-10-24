import { GLRenderer } from "../webgl/gl-renderer";
import { RenderObject, RenderRange } from "../core/render-object";
import { GLProgram } from "../webgl/program/program";
import { Geometry } from "../core/geometry";
import { BufferData } from "../core/buffer-data";
import { Material } from "../core/material";
import { GLTextureUniform } from "../webgl/program/uniform/uniform-texture";
import { Nullable, GLReleasable } from "../type";
import { Observable } from "../core/observable";
import { GLFramebuffer } from '../webgl/gl-framebuffer';
import { QuadSource } from './render-source';
import { CopyShading } from "../shading/pass-lib/copy";
import { NormalShading } from "../artgl";
import { VAOCreateCallback } from "../webgl/resource-manager/vao";
import { Vector4 } from "../math/vector4";
import { Shading, ShaderUniformProvider } from "../core/shading";
import { Interactor } from "../interact/interactor";
import { Vector4Like } from "../math/interface";
import { Renderable } from "./interface";
import { Camera } from "../core/camera";
import { PerspectiveCamera, PerspectiveCameraInstance } from "../camera/perspective-camera";
import { Matrix4 } from "../math";
import { Texture } from "../core/texture";
import { CubeTexture } from "../core/texture-cube";

export interface Size {
  width: number;
  height: number;
}

const copyShading = new Shading().decorate(new CopyShading());
const quad = new QuadSource();

interface RenderEngineConstructConfig{

}

export class RenderEngine implements GLReleasable {
  constructor(el: HTMLCanvasElement, ctxOptions?: any) {
    this.renderer = new GLRenderer(el, ctxOptions);
    this.interactor = new Interactor(el);

    this.preferVAO = true;
  }

  readonly interactor: Interactor

  readonly renderer: GLRenderer;

  _preferVAO: boolean = true;
  _vaoEnabled: boolean = false;
  get vaoEnabled(): boolean { return this._vaoEnabled };
  get preferVAO(): boolean { return this._preferVAO };
  set preferVAO(val: boolean) {
    this._preferVAO = val;
    if (val) {
      if (!this.renderer.vaoManager.isSupported) {
        console.warn(`prefer vao is set to true, but your environment cant support vao, vaoEnabled is false`)
      }
      this._vaoEnabled = true
    } else {
      this.renderer.vaoManager.releaseGL();
      this._vaoEnabled = false
    }
  }

  // resize
  readonly resizeObservable: Observable<Size> = new Observable<Size>();
  setSize(width: number, height: number) {
    if (this.renderer.setSize(width, height)) {
      this.resizeObservable.notifyObservers({
        width, height
      })
    }
  }
  setActualSize(width: number, height: number) {
    if (this.renderer.setRawRenderSize(width, height)) {
      this.resizeObservable.notifyObservers({
        width, height
      })
    }
  }
  ////


  //// render APIs
  render(source: Renderable) {
    source.render(this);
  }

  renderFrameBuffer(framebuffer: GLFramebuffer, debugViewPort: Vector4) {
    this.renderer.setRenderTargetScreen();
    this.renderer.state.setViewport(
      debugViewPort.x, debugViewPort.y,
      debugViewPort.z, debugViewPort.w
    );

    this.overrideShading = copyShading;
    this.overrideShading.defineFBOInput(
      framebuffer.name, 'copySource'
    );
    this.render(quad);
    this.overrideShading = null;
  }
  ////


  //// low level resource binding
  private activeCamera: Camera = new PerspectiveCamera()
  renderObjectWorldMatrix = new Matrix4();
  useCamera(camera: Camera) {
    this.activeCamera = camera;
  }



  private lastUploadedShaderUniformProvider: Map<ShaderUniformProvider, number> = new Map();
  private lastProgramRendered: Nullable<GLProgram> = null;

  private currentShading: Nullable<Shading> = null;
  private currentProgram: Nullable<GLProgram> = null;

  useShading(shading: Nullable<Shading>) {

    // todo
    this.activeCamera.renderObjectWorldMatrix = this.renderObjectWorldMatrix


    if (shading === null) {
      this.currentShading = null;
      this.currentProgram = null;
      return;
    }

    // get program, refresh provider cache if changed
    const program = shading.getProgram(this);
    if (this.lastProgramRendered !== program) {
      this.lastUploadedShaderUniformProvider.clear();
    }

    this.currentProgram = program;
    this.currentShading = shading;
    this.renderer.useProgram(program);

    const shadingParams = shading.params;
    shading._decorators.forEach(defaultDecorator => {
      let overrideDecorator
      if (shadingParams !== undefined) {
        overrideDecorator = shadingParams.get(defaultDecorator)
      }
      if (overrideDecorator === undefined && defaultDecorator instanceof Camera) {
        overrideDecorator = this.activeCamera
      }
      const decorator = overrideDecorator === undefined ? defaultDecorator : overrideDecorator;
      decorator.foreachProvider(provider => {
        const syncedVersion = this.lastUploadedShaderUniformProvider.get(provider)
        if (syncedVersion !== undefined
          && syncedVersion === provider._version // no new change
        ) {
          // if we found this uniform provider has updated before and not changed, we can skip!
          return;
        }
        provider.uniforms.forEach((value, key) => {
          if (value instanceof Texture || value instanceof CubeTexture) {
            program.setTextureIfExist(key, value.getGLTexture(this));
          } else {
            program.setUniformIfExist(key, value);
          }
        })
        this.lastUploadedShaderUniformProvider.set(provider, provider._version)
      })
    })

  }

  useMaterial(material?: Material) {
    if (this.currentProgram === null) {
      throw 'shading not exist'
    }
    this.currentProgram.textures.forEach((tex: GLTextureUniform) => {
      let glTexture: WebGLTexture | undefined;

      // acquire texture from material
      if (material !== undefined) {
        const texture = material.getChannelTexture(tex.name);
        glTexture = texture.getGLTexture(this);
      }

      // acquire texture from framebuffer
      if (glTexture === undefined) {
        const framebufferName = this.currentShading!.framebufferTextureMap[tex.name];
        if (framebufferName !== undefined) {
          glTexture = this.renderer.framebufferManager.getFramebufferTexture(framebufferName);
        }
      }

      if (glTexture === undefined) {
        return
        // throw `texture <${tex.name}>bind failed, for framebuffer texture, setup program.framebufferTextureMap`
      }

      tex.useTexture(glTexture);
    })
  }

  useGeometry(geometry: Geometry) {

    const program = this.currentProgram;
    if (program === null) {
      throw 'shading not exist'
    }

    // check index buffer and update program.indexUINT
    if (program.useIndexDraw) {
      if (geometry.indexBuffer === null) {
        throw 'indexBuffer not found for index draw'
      }
      const geometryIndexBuffer = geometry.indexBuffer;
      if (geometryIndexBuffer.data instanceof Uint32Array) {
        program.indexUINT = true;
      } else {
        program.indexUINT = false;
      }
    }

    // vao check
    let vaoUnbindCallback: VAOCreateCallback | undefined;
    if (this._vaoEnabled) {
      vaoUnbindCallback = this.renderer.vaoManager.connectGeometry(geometry, this.currentShading!)
      if (vaoUnbindCallback === undefined) {
        return;// vao has bind, geometry buffer is ok;
      }
    }

    // common procedure
    program.attributes.forEach(att => {
      const bufferData = geometry.getBuffer(att.name);
      if (bufferData === undefined) {
        throw `program needs an attribute named ${att.name}, but cant find in geometry data`;
      }
      const glBuffer = this.createOrUpdateAttributeBuffer(bufferData, false);
      att.useBuffer(glBuffer);
    })

    if (program.useIndexDraw) {
      const geometryIndexBuffer = geometry.indexBuffer;
      if (geometryIndexBuffer === null) {
        throw "index draw need index buffer"
      }
      const glBuffer = this.createOrUpdateAttributeBuffer(geometryIndexBuffer, true);
      program.useIndexBuffer(glBuffer);
    }

    // create vao
    if (this._vaoEnabled) {
      if (vaoUnbindCallback! !== undefined) {
        vaoUnbindCallback.unbind();
        this.renderer.vaoManager.useVAO(vaoUnbindCallback.vao)
      }
    }
  }

  useRange(geometry: Geometry, range?: RenderRange) {
    const program = this.currentProgram;
    if (program === null) {
      throw 'shading not exist'
    }
    let start = 0;
    let count = 0;
    if (range === undefined) {
      if (geometry.indexBuffer !== null) {
        count = geometry.indexBuffer.data.length;
      } else {
        throw 'range should be set if use none index geometry'
      }
    } else {
      start = range.start;
      count = range.count;
    }
    program.drawFrom = start;
    program.drawCount = count;
  }


  private overrideShading: Nullable<Shading> = null;
  public defaultShading: Shading = new Shading()
    .decorate(PerspectiveCameraInstance)
    .decorate(new NormalShading());
  setOverrideShading(shading: Nullable<Shading>): void {
    this.overrideShading = shading;
  }
  getOverrideShading(): Nullable<Shading> {
    return this.overrideShading;
  }
  getRealUseShading(object: RenderObject) {
    // // get shading, check override, default situation
    let shading: Shading;
    if (this.overrideShading !== null) {
      shading = this.overrideShading;
    } else if (object.shading !== undefined) {
      shading = object.shading;
    } else {
      shading = this.defaultShading;
    }
    return shading;
  }



  createFramebuffer(key: string, width: number, height: number, hasDepth: boolean): GLFramebuffer {
    return this.renderer.framebufferManager.createFrameBuffer(key, width, height, hasDepth);
  }
  getFramebuffer(key: string): GLFramebuffer | undefined {
    return this.renderer.framebufferManager.getFramebuffer(key);
  }
  deleteFramebuffer(fbo: GLFramebuffer): void {
    this.renderer.framebufferManager.deleteFramebuffer(fbo);
  }
  setRenderTargetScreen(): void {
    this.renderer.setRenderTargetScreen();
  }
  setRenderTarget(framebuffer: GLFramebuffer): void {
    this.renderer.setRenderTarget(framebuffer);
  }
  renderBufferWidth(): number {
    return this.renderer.width;
  }
  renderBufferHeight(): number {
    return this.renderer.height;
  }




  setViewport(x: number, y: number, width: number, height: number): void {
    this.renderer.state.setViewport(x, y, width, height);
  }
  setFullScreenViewPort(): void {
    this.renderer.state.setViewport(0, 0, this.renderBufferWidth(), this.renderBufferHeight());
  }
  setClearColor(color: Vector4Like): void {
    this.renderer.state.colorbuffer.setClearColor(color);
  }
  getClearColor(color: Vector4Like): Vector4Like {
    return color.copy(this.renderer.state.colorbuffer.currentClearColor);
  }
  resetDefaultClearColor(): void {
    this.renderer.state.colorbuffer.resetDefaultClearColor();
  }
  clearColor(): void {
    this.renderer.state.colorbuffer.clear();
  }
  clearDepth(): void {
    this.renderer.state.depthbuffer.clear();
  }



  //  GL resource acquisition
  getProgram(shading: Shading) {
    return this.renderer.programManager.getProgram(shading);
  }

  deleteProgram(shading: Shading) {
    this.renderer.programManager.deleteProgram(shading);
  }

  getGLAttributeBuffer(bufferData: BufferData) {
    return this.renderer.attributeBufferManager.getGLBuffer(bufferData.data.buffer as ArrayBuffer);
  }

  createOrUpdateAttributeBuffer(
    bufferData: BufferData,
    useForIndex: boolean): WebGLBuffer {
    return this.renderer.attributeBufferManager.updateOrCreateBuffer(
      bufferData.data.buffer as ArrayBuffer, useForIndex, bufferData._version);
  }





  releaseGL() {
    this.renderer.releaseGL();
  }

  dispose() {
    this.resizeObservable.clear();
    this.releaseGL();
    this.interactor.dispose();
  }


}