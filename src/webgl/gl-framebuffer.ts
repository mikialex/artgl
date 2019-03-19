import { GLRenderer } from "./gl-renderer";
import { Vector4 } from "../math/vector4";



export class GLFrameAttachedTexture{
  constructor(gl:WebGLRenderingContext, framebuffer: GLFramebuffer, attachPoint:number) {
    this.framebuffer = framebuffer;
    this.attachPoint = attachPoint;
    this.gl = gl;
    this.init();
  }
  gl: WebGLRenderingContext;
  framebuffer: GLFramebuffer;
  gltexture: WebGLTexture;
  textureStoreId: string;
  attachPoint: number;

  init() {
    const gl = this.gl;
    const framebuffer = this.framebuffer;
    this.textureStoreId = framebuffer.renderer.textureManger.
      createTextureForRenderTarget(framebuffer.width, framebuffer.height);
    this.gltexture = framebuffer.renderer.textureManger.getGLTexture(this.textureStoreId);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.wegbglFrameBuffer);
    const attachmentPoint = GLAttachmentPoints[this.attachPoint];
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.gltexture, 0);
  }

  updateSize() {
    this.disposeTexture();
    this.init();
  }

  disposeTexture() {
    this.framebuffer.renderer.textureManger.deleteGLTexture(this.textureStoreId);
    this.textureStoreId = undefined;
    this.gltexture = undefined;
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

export class GLFramebuffer{
  constructor(renderer: GLRenderer,name: string, width:number, height:number) {
    this.name = name;
    this.renderer = renderer;
    this.gl = renderer.gl;
    loadGLAttachmentPoints(this.gl);
    this.wegbglFrameBuffer = this.gl.createFramebuffer();
    this.width = width;
    this.height = height;
  }
  name: string;
  gl: WebGLRenderingContext;
  renderer: GLRenderer;

  width: number;
  height: number;

  enableDepth: boolean = true;
  webglDepthBuffer: WebGLRenderbuffer;
  wegbglFrameBuffer: WebGLFramebuffer;

  textureAttachedSlot: GLFrameAttachedTexture[] = [];

  debuggingViewport: Vector4 = new Vector4(0,0,200,200);

  resize(width:number, height:number) {
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;

      this.gl.deleteFramebuffer(this.wegbglFrameBuffer);
      this.wegbglFrameBuffer = this.gl.createFramebuffer();
      
      this.textureAttachedSlot.forEach(text => {
        if (text) {
          text.updateSize();
        }
      })

      this.disposeAttachedDepthBuffer();
      this.createAttachDepthBuffer();

    }
  }

  createAttachTexture(attachPoint: number) {
    if (this.textureAttachedSlot[attachPoint] !== undefined) {
      throw 'framebuffer has attached texture'
    }
    const attachTexture = new GLFrameAttachedTexture(this.gl, this, attachPoint);
    this.textureAttachedSlot[attachPoint] = attachTexture;

  }

  createAttachDepthBuffer() {
    const gl = this.gl;
    const depthBuffer = gl.createRenderbuffer();
    this.webglDepthBuffer = depthBuffer;

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.wegbglFrameBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
  }

  disposeAttachedDepthBuffer() {
    this.gl.deleteRenderbuffer(this.webglDepthBuffer);
  }

  attachTexture(texture: GLFrameAttachedTexture, attachPoint: number) {
    // TODO
  }

  // read pixel info from this framebuffer
  readPixels(x:number, y:number, width: number, height: number) {
    
  }

  dispose() {
    this.textureAttachedSlot.forEach(text => {
      if (text) {
        text.dispose();
      }
    })
    this.disposeAttachedDepthBuffer();
    this.gl.deleteFramebuffer(this.wegbglFrameBuffer);
    this.wegbglFrameBuffer = undefined;
  }
}