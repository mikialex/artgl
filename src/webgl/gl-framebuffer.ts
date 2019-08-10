import { GLRenderer } from "./gl-renderer";
import { Nullable } from "../type";
import { PixelFormat } from "./const";
import { Texture } from "../core/texture";
import { RenderEngine } from "../engine/render-engine";



export class FramebufferAttachTexture extends Texture {
  width: number = 5;
  height: number = 5;

  upload(engine: RenderEngine): WebGLTexture {
    return engine.renderer.textureManger.createTextureForRenderTarget(this);
  }

  attach(engine: RenderEngine, framebuffer: GLFramebuffer, attachPoint: number) {
    engine.renderer.setRenderTarget(framebuffer);

    const gl = framebuffer.gl;
    this.width = framebuffer.width;
    this.height = framebuffer.height;
    this.releaseGraphics(engine);
    const glTexture = this.upload(engine);
    const attachmentPoint = GLAttachmentPoints[attachPoint];
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, glTexture, 0);
  }

}

const GLAttachmentPoints = [];
function loadGLAttachmentPoints(gl: WebGLRenderingContext) {
  if (GLAttachmentPoints.length === 0) {
    for (let i = 0; i < 32; i++) {
      GLAttachmentPoints[i] = gl['COLOR_ATTACHMENT' + i];
    }
  }
}

export type FramebufferReadBufferType = Uint8Array | Uint16Array | Float32Array;

export class GLFramebuffer {
  static buildFBOFormatKey(width: number, height: number, needDepth: boolean) {
    return `${width}-${height}-${needDepth}`
  }

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

  _formatKey: string;

  enableDepth: boolean = true;
  webglDepthBuffer: Nullable<WebGLRenderbuffer> = null;
  webglFrameBuffer: WebGLFramebuffer;

  textureAttachedSlot: FramebufferAttachTexture[] = [];

  private updateFormatKey() {
    this._formatKey = GLFramebuffer.buildFBOFormatKey(
      this.width, this.height, this.enableDepth
    );
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

  resize(engine: RenderEngine, width: number, height: number) {

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
        text.attach(engine, this, index);
      }
    })

    this.disposeAttachedDepthBuffer();
    this.createAttachDepthBuffer();
    this.updateFormatKey();

  }

  createAttachTexture(engine: RenderEngine,attachPoint: number) {
    if (this.textureAttachedSlot[attachPoint] !== undefined) {
      throw 'framebuffer has attached texture'
    }
    const attachTexture = new FramebufferAttachTexture();
    attachTexture.attach(engine, this, attachPoint);
    this.textureAttachedSlot[attachPoint] = attachTexture;

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
  }

  disposeAttachedDepthBuffer() {
    this.gl.deleteRenderbuffer(this.webglDepthBuffer);
    this.webglDepthBuffer = null;
  }

  attachTexture(texture: FramebufferAttachTexture, attachPoint: number) {
    // TODO
  }

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
    this.textureAttachedSlot = [];
    this.disposeAttachedDepthBuffer();
    this.gl.deleteFramebuffer(this.webglFrameBuffer);
    this.webglFrameBuffer = null;
  }
}