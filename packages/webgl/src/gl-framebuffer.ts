import { GLRenderer } from "./gl-renderer";
import { Nullable, TextureSource } from "@artgl/shared";
import { PixelFormat, PixelDataType, TextureWrap, TextureFilter } from "./const";
import { GLReleasable } from "./interface";


export class FramebufferAttachTexture implements GLReleasable {

  isDataTexture: true = true;

  width = 0;
  height = 0;

  private _dataType: PixelDataType = PixelDataType.UNSIGNED_BYTE
  get dataType() { return this._dataType }

  private _wrapS: TextureWrap = TextureWrap.clampToEdge
  get wrapS() { return this._wrapS }

  private _wrapT: TextureWrap = TextureWrap.repeat
  get wrapT() { return this._wrapT }


  private _magFilter: TextureFilter = TextureFilter.nearest
  get magFilter() { return this._magFilter }

  private _minFilter: TextureFilter = TextureFilter.nearest
  get minFilter() { return this._minFilter }

  getVersion() {
    return 0;
  }

  releaseGL(renderer: GLRenderer) {
    renderer.textureManger.deleteGLTexture(this);
  }

}

const GLAttachmentPoints: number[] = [];
function loadGLAttachmentPoints(gl: WebGLRenderingContext) {
  if (GLAttachmentPoints.length === 0) {
    for (let i = 0; i < 32; i++) {
      GLAttachmentPoints[i] = (gl as any)['COLOR_ATTACHMENT' + i];
    }
  }
}

export type FramebufferReadBufferType = Uint8Array | Uint16Array | Float32Array;

export class GLFramebuffer {
  
  constructor(renderer: GLRenderer, name: string, width: number, height: number) {
    this.name = name;
    this.renderer = renderer;
    this.gl = renderer.gl;
    loadGLAttachmentPoints(this.gl);
    this.webglFrameBuffer = this.createGLFramebuffer();
    this.width = width;
    this.height = height;
    this.updateFormatKey();
  }
  name: string;
  gl: WebGLRenderingContext;
  renderer: GLRenderer;

  width: number;
  height: number;

  _formatKey: string = "??";
  getFormatKey() {
    return this._formatKey;
  }
  private updateFormatKey() {
    this._formatKey = this.buildFBOFormatKey(
      this.width, this.height, this._enableDepth
    );
  }
  buildFBOFormatKey(width: number, height: number, needDepth: boolean) {
    return `${width}-${height}-${needDepth}`
  }

  _enableDepth: boolean = false;
  webglDepthBuffer: Nullable<WebGLRenderbuffer> = null;
  webglFrameBuffer: Nullable<WebGLFramebuffer>;

  textureAttachedSlot: FramebufferAttachTexture[] = [];

  getMainAttachedTexture() {
    return this.textureAttachedSlot[0]
  }

  createGLFramebuffer() {
    const buffer = this.gl.createFramebuffer();
    if (buffer === null) {
      throw 'webgl framebuffer create failed'
    }
    return buffer;
  }

  createGLRenderbuffer() {
    const buffer = this.gl.createRenderbuffer();
    if (buffer === null) {
      throw 'webgl renderbuffer create failed'
    }
    return buffer;
  }

  attach(texture: FramebufferAttachTexture, attachPoint: number) {
    this.renderer.setRenderTarget(this);

    const gl = this.gl;
    texture.width = this.width;
    texture.height = this.height;
    texture.releaseGL(this.renderer);
    const glTexture = this.renderer.textureManger.createTextureForRenderTarget(texture);
    const attachmentPoint = GLAttachmentPoints[attachPoint];
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, glTexture, 0);
  }

  resize(width: number, height: number) {

    if (this.width === width && this.height === height) {
      return;
    }

    this.width = width;
    this.height = height;

    this.gl.deleteFramebuffer(this.webglFrameBuffer);
    this.webglFrameBuffer = this.createGLFramebuffer();

    this.renderer.setRenderTarget(this);

    this.textureAttachedSlot.forEach((text, index) => {
      if (text) {
        this.attach(text, index);
      }
    })

    this.disposeAttachedDepthBuffer();
    this.createAttachDepthBuffer();
    this.updateFormatKey();

  }

  createAttachTexture(attachPoint: number) {
    if (this.textureAttachedSlot[attachPoint] !== undefined) {
      throw 'framebuffer has attached texture'
    }
    const attachTexture = new FramebufferAttachTexture();
    this.attach(attachTexture, attachPoint);
    this.textureAttachedSlot[attachPoint] = attachTexture;
    this.updateFormatKey();
    return this;
  }

  createAttachDepthBuffer() {
    this.renderer.setRenderTarget(this);

    if (this.webglDepthBuffer !== null) {
      return
    }
    const gl = this.gl;
    const depthBuffer = this.createGLRenderbuffer();
    this.webglDepthBuffer = depthBuffer;

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    this._enableDepth = true;
    this.updateFormatKey();
    return this;
  }

  disposeAttachedDepthBuffer() {
    this.gl.deleteRenderbuffer(this.webglDepthBuffer);
    this.webglDepthBuffer = null;
  }

  // attachTexture(texture: FramebufferAttachTexture, attachPoint: number) {
  //   // TODO
  // }

  // read pixel info from this framebuffer
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
  readPixels(x: number, y: number, width: number, height: number, readBuffer: FramebufferReadBufferType) {
    // TODO
    const gl = this.gl;
    this.renderer.setRenderTarget(this);
    if (x < 0 || y < 0 || x > (this.width - width) || y > (this.height - height)) {
      throw "read area exceed frameSize"
    }
    if (readBuffer.length < width * height) {
      throw "readBuffer size not sufficient"
    }
    gl.readPixels(x, y, width, height, PixelFormat.RGBA, gl.UNSIGNED_BYTE, readBuffer); 
  }

  dispose() {
    this.textureAttachedSlot.forEach(texture => {
      if (texture !== undefined) {
        texture.releaseGL(this.renderer);
      }
    })
    this.textureAttachedSlot = [];
    this.disposeAttachedDepthBuffer();
    this.gl.deleteFramebuffer(this.webglFrameBuffer);
    this.webglFrameBuffer = null;
  }
}