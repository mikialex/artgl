import { GLRenderer } from "./gl-renderer";
import { GLExtList } from "./gl-info";
import { GLReleasable } from "../type";
import { Geometry } from "../core/geometry";

export interface VAOCreateCallback{
  vao: any,
  unbind: () => void
}

export class GLVAOManager implements GLReleasable{
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;
  readonly vaoExt: any;
  readonly isSupported: boolean;
  private vaos: WeakMap<Geometry, any> = new WeakMap();

  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.vaoExt = renderer.glInfo.getExtension(GLExtList.OES_vertex_array_object);
    this.isSupported = this.vaoExt !== undefined;
  }

  getVAO(geometry: Geometry) {
    return this.vaos.get(geometry);
  }

  createVAO(geometry: Geometry): VAOCreateCallback {
    const vao = this.vaoExt.createVertexArrayOES(); 
    this.vaoExt.bindVertexArrayOES(vao);
    this.vaos.set(geometry, vao);
    return {
      vao, unbind: () => {
        this.vaoExt.bindVertexArrayOES(null);
      }
    };
  }

  deleteVAO(geometry: Geometry) {
    this.vaos.delete(geometry);
  }

  useVAO(vao: any) {
    this.vaoExt.bindVertexArrayOES(vao);
  }

  releaseGL(): void {
    this.vaoExt.bindVertexArrayOES(null);
    this.vaos = new WeakMap();
  }
}