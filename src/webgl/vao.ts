import { GLRenderer } from "./gl-renderer";
import { GLExtList } from "./gl-info";
import { GLReleasable } from "../type";
import { Geometry } from "../core/geometry";
import { Shading } from "../core/shading";

type webglVAO = any;

export interface VAOCreateCallback {
  vao: webglVAO,
  unbind: () => void
}

export class GLVAOManager implements GLReleasable {
  readonly gl: WebGLRenderingContext;
  readonly renderer: GLRenderer;
  readonly vaoExt: any;
  readonly isSupported: boolean;

  private vaoMap: Map<Shading, Map<Geometry, webglVAO>> = new Map();
  private geometryVersionMap: Map<Geometry, number> = new Map();
  private shadingVersionMap: Map<Shading, number> = new Map();

  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.vaoExt = renderer.glInfo.getExtension(GLExtList.OES_vertex_array_object);
    this.isSupported = this.vaoExt !== undefined;
  }

  connectGeometry(geometry: Geometry, shading: Shading) {
    let vaoUnbindCallback: VAOCreateCallback;

    const webglVAO = this.getVAO(shading, geometry)

    if (webglVAO === undefined) {
      vaoUnbindCallback = this.createVAO(shading, geometry);
    } else {

      // validate vao is dirty by check version
      const lastGeometryVersion = this.geometryVersionMap.get(geometry);
      const lastShadingVersion = this.shadingVersionMap.get(shading);

      if (lastGeometryVersion !== geometry._version) {
        this.deleteAllGeometryCreatedVAO(geometry);
        vaoUnbindCallback = this.createVAO(shading, geometry);
      } else if (lastShadingVersion !== shading._version) {
        this.deleteAllShadingCreatedVAO(shading);
        vaoUnbindCallback = this.createVAO(shading, geometry);
      } else {
        this.useVAO(webglVAO)
        return;
      }
    }
    return vaoUnbindCallback;
  }

  private getVAO(shading: Shading, geometry: Geometry) {
    const map = this.vaoMap.get(shading);
    if (map === undefined) {
      return undefined
    }
    return map.get(geometry);
  }

  private createVAO(shading: Shading, geometry: Geometry): VAOCreateCallback {
    const vao = this.vaoExt.createVertexArrayOES();
    this.vaoExt.bindVertexArrayOES(vao);

    let map = this.vaoMap.get(shading);
    if (map === undefined) {
      map = new Map();
    }
    map.set(geometry, vao)

    this.vaoMap.set(shading, map);
    this.geometryVersionMap.set(geometry, geometry._version);
    this.shadingVersionMap.set(shading, shading._version);

    return {
      vao, unbind: () => {
        this.vaoExt.bindVertexArrayOES(null);
      }
    };
  }

  deleteVAO(shading: Shading, geometry: Geometry) {
    this.geometryVersionMap.delete(geometry);
    this.shadingVersionMap.delete(shading);

    let map = this.vaoMap.get(shading);
    if (map === undefined) {
      return;
    }
    let vao = map.get(geometry);
    if (vao !== undefined) {
      this.vaoExt.deleteVertexArrayOES(vao)
      map.delete(geometry);
    }
  }

  deleteAllGeometryCreatedVAO(geometry: Geometry) {
    this.geometryVersionMap.delete(geometry);
    this.vaoMap.forEach(map => {
      const vao = map.get(geometry);
      if (vao !== undefined) {
        this.vaoExt.deleteVertexArrayOES(vao)
      }
      map.delete(vao);
    })
  }

  deleteAllShadingCreatedVAO(shading: Shading) {
    this.shadingVersionMap.delete(shading);
    const map = this.vaoMap.get(shading);
    if (map !== undefined) {
      map.forEach(vao => {
        this.vaoExt.deleteVertexArrayOES(vao)
      });
    }
    this.vaoMap.delete(shading);
  }

  useVAO(vao: webglVAO) {
    this.vaoExt.bindVertexArrayOES(vao);
  }

  releaseGL(): void {
    this.vaoExt.bindVertexArrayOES(null);
    this.vaoMap = new Map();
    this.shadingVersionMap = new Map();
    this.geometryVersionMap = new Map();
  }
}