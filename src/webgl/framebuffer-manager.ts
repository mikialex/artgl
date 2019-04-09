import { GLFramebuffer } from "./gl-framebuffer";
import { GLRenderer } from "./gl-renderer";
import { GLRealeaseable } from '../type';

export class GLFrameBufferManager implements GLRealeaseable{
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

  getFramebuffer(framebufferName: string) {
    return this.framebuffers.get(framebufferName);
  }

  getFramebufferTexture(framebufferName: string): WebGLTexture{
    const frambuffer = this.framebuffers.get(framebufferName);
    if (frambuffer === undefined) {
      throw `cant find frambuffer ${framebufferName}`
    }
    return frambuffer.textureAttachedSlot[0].gltexture;
  }

  releaseGL() {
    
  }
}