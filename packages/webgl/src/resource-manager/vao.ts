import { GLRenderer } from "../gl-renderer";
import { GLExtList } from "../gl-info";
import { Nullable } from "@artgl/shared";
import { GLReleasable, WebGLAttributeBuffersProvider, ShadingProvider } from "../interface";

type webglVAO = WebGLVertexArrayObject ;
interface webglVAOExt {
  createVertexArrayOES(): webglVAO;
  bindVertexArrayOES(vao: Nullable<webglVAO>): void;
  deleteVertexArrayOES(vao: webglVAO): void;
}

export interface VAOCreateCallback {
  vao: webglVAO,
  unbind: () => void
}

export class GLVAOManager implements GLReleasable {
  private gl: WebGLRenderingContext;
  private renderer: GLRenderer;
  private vaoExt: Nullable<webglVAOExt>;
  readonly isSupported: boolean;

  private vaoMap: Map<ShadingProvider, Map<WebGLAttributeBuffersProvider, webglVAO>> = new Map();
  private geometryVersionMap: Map<WebGLAttributeBuffersProvider, number> = new Map();
  private shadingVersionMap: Map<ShadingProvider, number> = new Map();

  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.vaoExt = renderer.glInfo.getExtension(GLExtList.OES_vertex_array_object);
    this.isSupported = this.vaoExt !== undefined;
  }

  connectGeometry(geometry: WebGLAttributeBuffersProvider, shading: ShadingProvider) {
    let vaoUnbindCallback: VAOCreateCallback;

    const webglVAO = this.getVAO(shading, geometry)

    if (webglVAO === undefined) {
      vaoUnbindCallback = this.createVAO(shading, geometry);
    } else {

      // validate vao is dirty by check version
      const lastGeometryVersion = this.geometryVersionMap.get(geometry);
      const lastShadingVersion = this.shadingVersionMap.get(shading);

      if (lastGeometryVersion !== geometry.getVersion()) {
        this.deleteAllGeometryCreatedVAO(geometry);
        vaoUnbindCallback = this.createVAO(shading, geometry);
      } else if (lastShadingVersion !== shading.getVersion()) {
        this.deleteAllShadingCreatedVAO(shading);
        vaoUnbindCallback = this.createVAO(shading, geometry);
      } else {
        this.useVAO(webglVAO)
        return;
      }
    }
    return vaoUnbindCallback;
  }

  private getVAO(shading: ShadingProvider, geometry: WebGLAttributeBuffersProvider) {
    const map = this.vaoMap.get(shading);
    if (map === undefined) {
      return undefined
    }
    return map.get(geometry);
  }

  private createVAO(shading: ShadingProvider, geometry: WebGLAttributeBuffersProvider): VAOCreateCallback {
    let vao: Nullable<webglVAO>
    if (this.renderer.ctxVersion === 2) {
      const gl = (this.gl as WebGL2RenderingContext); 
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
    } else {
      vao = this.vaoExt!.createVertexArrayOES();
      this.vaoExt!.bindVertexArrayOES(vao);
    }
    if (vao === null) {
      throw 'webgl vao create failed'
    }

    let map = this.vaoMap.get(shading);
    if (map === undefined) {
      map = new Map();
    }
    map.set(geometry, vao)

    this.vaoMap.set(shading, map);
    this.geometryVersionMap.set(geometry, geometry.getVersion());
    this.shadingVersionMap.set(shading, shading.getVersion());

    return {
      vao, unbind: () => {
        this.useVAO(null)
      }
    };
  }

  deleteVAOByShadingAndGeometry(shading: ShadingProvider, geometry: WebGLAttributeBuffersProvider) {
    this.geometryVersionMap.delete(geometry);
    this.shadingVersionMap.delete(shading);

    let map = this.vaoMap.get(shading);
    if (map === undefined) {
      return;
    }
    let vao = map.get(geometry);
    if (vao !== undefined) {
      this.deleteVAO(vao)
      map.delete(geometry);
    }
  }

  deleteAllGeometryCreatedVAO(geometry: WebGLAttributeBuffersProvider) {
    this.geometryVersionMap.delete(geometry);
    this.vaoMap.forEach(map => {
      const vao = map.get(geometry);
      if (vao !== undefined) {
        this.deleteVAO(vao)
      }
      map.delete(geometry);
    })
  }

  deleteAllShadingCreatedVAO(shading: ShadingProvider) {
    this.shadingVersionMap.delete(shading);
    const map = this.vaoMap.get(shading);
    if (map !== undefined) {
      map.forEach(vao => {
        this.deleteVAO(vao)
      });
    }
    this.vaoMap.delete(shading);
  }

  deleteVAO(vao: webglVAO) {
    if (this.renderer.ctxVersion === 2) {
      const gl = (this.gl as WebGL2RenderingContext); 
      gl.deleteVertexArray(vao);
    } else {
      this.vaoExt!.deleteVertexArrayOES(vao);
    }
  }

  useVAO(vao: Nullable<webglVAO>) {
    if (this.renderer.ctxVersion === 2) {
      const gl = (this.gl as WebGL2RenderingContext); 
      gl.bindVertexArray(vao);
    } else {
      this.vaoExt!.bindVertexArrayOES(vao);
    }
  }

  releaseGL(): void {
    this.useVAO(null);
    this.vaoMap = new Map();
    this.shadingVersionMap = new Map();
    this.geometryVersionMap = new Map();
  }
}