import { GLRenderer } from "./gl-renderer";
import { GLExtList } from "./gl-info";
import { GLRealeaseable } from "../type";

export class GLVAO{
  gl: WebGLRenderingContext;
  renderer: GLRenderer;
  manager: GLVAOManager

  constructor(renderer: GLRenderer, manager: GLVAOManager) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.manager = manager;
  }
}

export class GLVAOManager implements GLRealeaseable{
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;
  readonly vaoExt: any;
  readonly isSupported: boolean;

  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.vaoExt = renderer.glInfo.getExtension(GLExtList.OES_vertex_array_object);
    this.isSupported = this.vaoExt !== undefined;
  }

  releaseGL(): void {
    throw new Error("Method not implemented.");
  }
}