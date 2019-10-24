import { GLReleasable, Nullable } from "../type";
import { GLRenderer } from "./gl-renderer";
import { ShaderUniformProvider } from "../core/shading";

export class GLUBOManager implements GLReleasable {
  constructor(renderer: GLRenderer) {
    if (renderer.ctxVersion !== 2) {
      throw 'WebGL UBO only support webgl2 context'
    }
    this.gl = renderer.gl as WebGL2RenderingContext;
    this.renderer = renderer;
  }

  private gl: WebGL2RenderingContext;
  private renderer: GLRenderer;

  private bindingPoints: Nullable<WebGLBuffer>[] = [];

  private UBOData: Map<ShaderUniformProvider, WebGLBuffer> = new Map();
  private UBOVersionMap: Map<ShaderUniformProvider, number> = new Map();

  bindProviderTo(provider: ShaderUniformProvider, bindPoint: number) {
    
    // this.gl.bindBufferBase()
  }

  createUBO(provider: ShaderUniformProvider) {
    
  }

  getUBO(provider: ShaderUniformProvider) {
    const ubo = this.UBOData.get(provider);
    if (ubo === undefined) {
      return this.createUBO(provider);
    } else {
      if (provider._version !== this.UBOVersionMap.get(provider)) {
        this.deleteUBO(provider, ubo);
        return this.createUBO(provider);
      } else {
        return ubo;
      }
    }
  }

  deleteProviderUBO(provider: ShaderUniformProvider) {
    const buffer = this.UBOData.get(provider);
    if (buffer !== undefined) {
      this.deleteUBO(provider, buffer);
    }
  }

  private deleteUBO(provider: ShaderUniformProvider, buffer: WebGLBuffer) {
    this.gl.deleteBuffer(buffer);
    this.UBOData.delete(provider);
    this.UBOVersionMap.delete(provider);
  }

  releaseGL(): void {
    this.UBOData.forEach(buffer => {
      this.gl.deleteBuffer(buffer);
    })
    this.UBOData.clear();
    this.UBOVersionMap.clear();
    this.bindingPoints = this.bindingPoints.map(_ => null);
  }
}