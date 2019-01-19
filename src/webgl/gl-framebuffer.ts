import { GLRenderer } from "./gl-renderer";



export class GLFrameAttachedTexture{
  constructor(framebuffer: GLFramebuffer) {
    this.framebuffer = framebuffer;

    this.gltexture = framebuffer.renderer.textureManger.
      createTextureForRenderTarget(framebuffer.width, framebuffer.height);
  }
  framebuffer: GLFramebuffer;
  gltexture: WebGLTexture;

  updateSize(width: number, height: number) {
    this.framebuffer.renderer.textureManger.
      updateRenderTargetSize(this.gltexture, width, height);
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
  constructor(renderer: GLRenderer,name: string) {
    this.name = name;
    this.renderer = renderer;
    this.gl = renderer.gl;
    loadGLAttachmentPoints(this.gl);
    const fb = this.gl.createFramebuffer();
    this.wegbglFrameBuffer = fb;
  }
  name: string;
  gl: WebGLRenderingContext;
  renderer: GLRenderer;

  width: number = 200;
  height: number = 200;

  wegbglFrameBuffer: WebGLFramebuffer;

  textureAttachedSlot: GLFrameAttachedTexture[] = [];

  setSize(width: number, height: number) {
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;
      this.textureAttachedSlot.forEach(text => {
        if (text) {
          text.updateSize(width, height);
        }
      })
    }
  }

  createAttachTexture(attachPoint: number) {
    if (this.textureAttachedSlot[attachPoint] !== undefined) {
      throw 'framebuffer has attached texture'
    }
    const attachTexture = new GLFrameAttachedTexture(this);
    this.textureAttachedSlot[attachPoint] = attachTexture;

    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.wegbglFrameBuffer);
    const attachmentPoint = GLAttachmentPoints[attachPoint];
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, attachTexture.gltexture, 0);

  }

  attachTexture(texture: GLFrameAttachedTexture, attachPoint: number) {
    // TODO
  }

  // read pixel info from this framebuffer
  readPixels(x:number, y:number, width: number, height: number) {
    
  }

  dispose() {
    
  }
}