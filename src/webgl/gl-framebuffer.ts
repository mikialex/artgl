import { GLRenderer } from "./gl-renderer";
import { Vector4 } from "../math/vector4";
import { Nullable } from "../type";
import { PixelFormat } from "./const";
import { Texture } from "../core/texture";
import { ARTEngine } from "../engine/render-engine";



export class FramebufferAttachTexture extends Texture {
  width: number = 5;
  height: number = 5;

  upload(engine: ARTEngine): WebGLTexture {
    return engine.renderer.textureManger.createTextureForRenderTarget(this);
  }

  attach(engine: ARTEngine, framebuffer: GLFramebuffer, attachPoint: number) {
    const gl = framebuffer.gl;
    this.width = framebuffer.width;
    this.height = framebuffer.height;
    this.releaseGraphics(engine);
    const glTexture = this.upload(engine);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.webglFrameBuffer);
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
  constructor(renderer: GLRenderer, name: string, width: number, height: number) {
    this.name = name;
    this.renderer = renderer;
    this.gl = renderer.gl;
    loadGLAttachmentPoints(this.gl);
    this.webglFrameBuffer = this.createGLFramebuffer();
    this.width = width;
    this.height = height;
  }
  name: string;
  gl: WebGLRenderingContext;
  renderer: GLRenderer;

  width: number;
  height: number;

  enableDepth: boolean = true;
  webglDepthBuffer: Nullable<WebGLRenderbuffer> = null;
  webglFrameBuffer: WebGLFramebuffer;

  textureAttachedSlot: FramebufferAttachTexture[] = [];

  debuggingViewport: Vector4 = new Vector4(0, 0, 200, 200);

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

  resize(engine: ARTEngine, width: number, height: number) {

    if (this.width === width && this.height === height) {
      return;
    }

    this.width = width;
    this.height = height;

    this.gl.deleteFramebuffer(this.webglFrameBuffer);
    this.webglFrameBuffer = this.createGLFramebuffer();

    this.textureAttachedSlot.forEach((text, index) => {
      if (text) {
        text.attach(engine, this, index);
      }
    })

    this.disposeAttachedDepthBuffer();
    this.createAttachDepthBuffer();

  }

  createAttachTexture(engine: ARTEngine,attachPoint: number) {
    if (this.textureAttachedSlot[attachPoint] !== undefined) {
      throw 'framebuffer has attached texture'
    }
    const attachTexture = new FramebufferAttachTexture();
    attachTexture.attach(engine, this, attachPoint);
    this.textureAttachedSlot[attachPoint] = attachTexture;

  }

  createAttachDepthBuffer() {
    if (this.webglDepthBuffer !== null) {
      return
    }
    const gl = this.gl;
    const depthBuffer = this.createGLRenderbuffer();
    this.webglDepthBuffer = depthBuffer;

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.webglFrameBuffer);
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
    // gl.readPixels(x, y, width, height, PixelFormat.RGBAFormat, type, readBuffer); 
  }

  dispose() {
    this.textureAttachedSlot = [];
    this.disposeAttachedDepthBuffer();
    this.gl.deleteFramebuffer(this.webglFrameBuffer);
    this.webglFrameBuffer = null;
  }
}