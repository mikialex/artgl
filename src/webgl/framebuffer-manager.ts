import { GLFramebuffer } from "./gl-framebuffer";
import { GLRenderer } from "./gl-renderer";

export class GLFrameBufferManager{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
  }
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;

  private framebuffers: Map<string, GLFramebuffer> = new Map();

  createFrameBuffer(name: string, width: number, height: number, enableDepth: boolean): GLFramebuffer{
    if (this.framebuffers.has(name)) {
      throw 'duplicate framebuffer key name';
    }

    const framebuffer = new GLFramebuffer(this.renderer, name);
    framebuffer.setSize(width, height);
    framebuffer.createAttachTexture(0);
    framebuffer.enableDepth = enableDepth;
    if (enableDepth) {
      framebuffer.createAttachDepthBuffer();
    }

    this.framebuffers.set(name, framebuffer);

    return framebuffer;
  }

  getFramebufferTexture(framebufferName: string): WebGLTexture{
    return this.framebuffers.get(framebufferName).textureAttachedSlot[0].gltexture;
  }
}