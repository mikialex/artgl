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

  createUBO(provider: ShaderUniformProvider) {
    
  }

  deleteUBO(provider: ShaderUniformProvider) {
    const buffer = this.UBOData.get(provider);
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