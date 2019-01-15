import { GLFramebuffer } from "./gl-framebuffer";
import { GLRenderer } from "./webgl-renderer";

export class GLFrameBufferManager{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
  }
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;

  createFrameBuffer(width:number, height:number): GLFramebuffer{
    const gl = this.gl;

    const framebuffer = new GLFramebuffer(width, height);

    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    framebuffer.wegbglFrameBuffer = fb;

    const texture = this.renderer.textureManger.createTextureForRenderTarget(width, height);
    framebuffer.bindingWebGLTexture = texture;

    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);

    return framebuffer;
  }
}