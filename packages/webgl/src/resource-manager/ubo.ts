import { GLReleasable, UBOProvider } from "../interface";
import {Nullable} from "@artgl/shared"

export class GLUBOManager implements GLReleasable {
  constructor(
    private gl: WebGL2RenderingContext
  ) { }

  private bindingPoints: Nullable<WebGLBuffer>[] = [];

  private UBOData: Map<UBOProvider, WebGLBuffer> = new Map();
  private UBOVersionMap: Map<UBOProvider, number> = new Map();

  bindProviderTo(ubo: WebGLBuffer, bindPoint: number) {
    this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, bindPoint, ubo);
  }

  private createUBO(provider: UBOProvider) {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    if (buffer === null) {
      throw 'Webgl create buffer failed for UBO';
    }
    gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, provider.getBlockedBuffer(), gl.STATIC_DRAW);
    return buffer;
  }

  getUBO(provider: UBOProvider) {
    const ubo = this.UBOData.get(provider);
    if (ubo === undefined) {
      const newUBO = this.createUBO(provider);
      this.UBOData.set(provider, newUBO);
      this.UBOVersionMap.set(provider, provider.getBlockedBufferVersion())
      return newUBO;
    } else {
      if (provider.getBlockedBufferVersion() !== this.UBOVersionMap.get(provider)) {
        this.deleteUBO(provider, ubo);
        return this.createUBO(provider);
      } else {
        return ubo;
      }
    }
  }

  deleteProviderUBO(provider: UBOProvider) {
    const buffer = this.UBOData.get(provider);
    if (buffer !== undefined) {
      this.deleteUBO(provider, buffer);
    }
  }

  private deleteUBO(provider: UBOProvider, buffer: WebGLBuffer) {
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