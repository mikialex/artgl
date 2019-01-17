import { GLFramebuffer } from "./gl-framebuffer";
import { GLRenderer } from "./webgl-renderer";
import { Texture } from "../core/texture";

export class GLFrameBufferManager{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
  }
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;

  private framebuffers: Map<string, GLFramebuffer> = new Map();

  createFrameBuffer(name: string, width: number, height: number): GLFramebuffer{
    if (this.framebuffers.has(name)) {
      throw 'duplicate framebuffer key name';
    }
    const gl = this.gl;

    const framebuffer = new GLFramebuffer(name, width, height);

    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    framebuffer.wegbglFrameBuffer = fb;

    const texture = this.renderer.textureManger.createTextureForRenderTarget(width, height);
    framebuffer.bindingWebGLTexture = texture;

    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);

    this.framebuffers.set(name, framebuffer);

    return framebuffer;
  }

  getFramebufferTexture(framebufferName: string): WebGLTexture{
    return // TODO
  }
}