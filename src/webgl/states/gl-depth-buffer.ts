import { GLRenderer } from "../webgl-renderer";

export class GLDepthBuffer {
  constructor(renderer: GLRenderer) {
    this.gl = renderer.gl;
  }

  currentDepthMask = null;
  currentDepthFunc = null;
  currentDepthClear = null;

  readonly gl: WebGLRenderingContext;

}