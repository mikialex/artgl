import { GLFramebuffer } from "./gl-framebuffer";
import { GLRenderer } from "./gl-renderer";

export class GLFrameBufferManager {
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

    const framebuffer = new GLFramebuffer(this.renderer, name, width, height);
    framebuffer.createAttachTexture(0);
    framebuffer.enableDepth = enableDepth;
    if (enableDepth) {
      framebuffer.createAttachDepthBuffer();
    }

    this.framebuffers.set(name, framebuffer);

    return framebuffer;
  }

  deleteFramebuffer(framebuffer: GLFramebuffer) {
    framebuffer.dispose();
    this.framebuffers.delete(framebuffer.name);
  }

  getFramebuffer(framebufferName: string) {
    return this.framebuffers.get(framebufferName);
  }

  getFramebufferTexture(framebufferName: string){
    const framebuffer = this.framebuffers.get(framebufferName);
    if (framebuffer === undefined) {
      throw `cant find framebuffer ${framebufferName}`
    }
    return this.renderer.textureManger.getGLTexture(framebuffer.textureAttachedSlot[0]);
  }

  dispose() {
    this.framebuffers.clear();
  }
}