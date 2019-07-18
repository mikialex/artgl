import { GLRenderer } from "./gl-renderer";
import { Vector4 } from "../math/vector4";
import { Nullable } from "../type";
import { PixelFormat } from "./const";



export class GLFrameAttachedTexture {
  constructor(gl: WebGLRenderingContext, framebuffer: GLFramebuffer, attachPoint: number) {
    this.framebuffer = framebuffer;
    this.attachPoint = attachPoint;
    this.gl = gl;
    this.init();
  }
  gl: WebGLRenderingContext;

  framebuffer: GLFramebuffer;
  glTexture: WebGLTexture;
  textureStoreId: string;

  attachPoint: number;

  init() {
    const gl = this.gl;
    const framebuffer = this.framebuffer;
    this.textureStoreId = framebuffer.renderer.textureManger.
      createTextureForRenderTarget(framebuffer.width, framebuffer.height);
    this.glTexture = framebuffer.renderer.textureManger.getGLTexture(this.textureStoreId);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.webglFrameBuffer);
    const attachmentPoint = GLAttachmentPoints[this.attachPoint];
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.glTexture, 0);
  }

  updateSize() {
    this.disposeTexture();
    this.init();
  }

  disposeTexture() {
    this.framebuffer.renderer.textureManger.deleteGLTexture(this.textureStoreId);
    this.textureStoreId = undefined;
    this.glTexture = undefined;
  }

  dispose() {
    this.disposeTexture();
    this.framebuffer = undefined;
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

  textureAttachedSlot: GLFrameAttachedTexture[] = [];

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

  resize(width: number, height: number) {

    if (this.width === width && this.height === height) {
      return;
    }

    this.gl.deleteFramebuffer(this.webglFrameBuffer);
    this.webglFrameBuffer = this.createGLFramebuffer();

    this.textureAttachedSlot.forEach(text => {
      if (text) {
        text.updateSize();
      }
    })

    this.disposeAttachedDepthBuffer();
    this.createAttachDepthBuffer();

    this.width = width;
    this.height = height;

  }

  createAttachTexture(attachPoint: number) {
    if (this.textureAttachedSlot[attachPoint] !== undefined) {
      throw 'framebuffer has attached texture'
    }
    const attachTexture = new GLFrameAttachedTexture(this.gl, this, attachPoint);
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

  attachTexture(texture: GLFrameAttachedTexture, attachPoint: number) {
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
    this.textureAttachedSlot.forEach(text => {
      if (text) {
        text.dispose();
      }
    })
    this.disposeAttachedDepthBuffer();
    this.gl.deleteFramebuffer(this.webglFrameBuffer);
    this.webglFrameBuffer = null;
  }
}