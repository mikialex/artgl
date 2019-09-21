import { GLRenderer } from "./gl-renderer";
import { GLExtList } from "./gl-info";
import { GLReleasable } from "../type";
import { Geometry } from "../core/geometry";
import { Shading } from "../core/shading";

type webglVAO = any;

export interface VAOCreateCallback{
  vao: webglVAO,
  unbind: () => void
}

export class GLVAOManager implements GLReleasable{
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;
  readonly vaoExt: any;
  readonly isSupported: boolean;
  private vaos: WeakMap<Shading, WeakMap<Geometry, webglVAO>> = new WeakMap();

  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.vaoExt = renderer.glInfo.getExtension(GLExtList.OES_vertex_array_object);
    this.isSupported = this.vaoExt !== undefined;
  }

  getVAO(shading: Shading, geometry: Geometry) {
    const map = this.vaos.get(shading);
    if (map === undefined) {
      return undefined
    }
    return map.get(geometry);
  }

  createVAO(shading: Shading, geometry: Geometry): VAOCreateCallback {
    const vao = this.vaoExt.createVertexArrayOES(); 
    this.vaoExt.bindVertexArrayOES(vao);

    let map = this.vaos.get(shading);
    if (map === undefined) {
      map = new WeakMap();
    }
    map.set(geometry, vao)

    this.vaos.set(shading, map);

    return {
      vao, unbind: () => {
        this.vaoExt.bindVertexArrayOES(null);
      }
    };
  }

  deleteVAO(shading: Shading, geometry: Geometry) {
    let map = this.vaos.get(shading);
    if (map === undefined) {
      return;
    }
    let vao = map.get(geometry);
    if (vao !== undefined) {
      this.vaoExt.deleteVAO(vao)
      map.delete(geometry);
    }
  }

  useVAO(vao: webglVAO) {
    this.vaoExt.bindVertexArrayOES(vao);
  }

  releaseGL(): void {
    this.vaoExt.bindVertexArrayOES(null);
    this.vaos = new WeakMap();
  }
}