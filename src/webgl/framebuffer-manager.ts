import { GLFramebuffer } from "./gl-framebuffer";
import { GLRenderer } from "./gl-renderer";
import { GLReleasable } from '../type';
import { ARTEngine } from "../engine/render-engine";

export class GLFrameBufferManager implements GLReleasable{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
  }
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;

  private framebuffers: Map<string, GLFramebuffer> = new Map();

  createFrameBuffer(engine: ARTEngine, name: string, width: number, height: number, enableDepth: boolean): GLFramebuffer{
    if (this.framebuffers.has(name)) {
      throw 'duplicate framebuffer key name';
    }

    const framebuffer = new GLFramebuffer(this.renderer, name, width, height);
    framebuffer.createAttachTexture(engine, 0);
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
    const framebuffer = this.framebuffers.get(framebufferName);
    if (framebuffer === undefined) {
      throw `cant find framebuffer ${framebufferName}`
    }
    return this.renderer.textureManger.getGLTexture(framebuffer.textureAttachedSlot[0]);
  }

  releaseGL() {
    
  }
}