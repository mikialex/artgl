import { GLRenderer } from "../gl-renderer";
import { GLReleasable } from '../../type';

export class GLAttributeBufferDataManager implements GLReleasable {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  readonly renderer: GLRenderer;
  private buffers: WeakMap<ArrayBuffer, WebGLBuffer> = new WeakMap();
  private bufferVersion: WeakMap<ArrayBuffer, number> = new WeakMap();

  getGLBuffer(arraybuffer: ArrayBuffer) {
    return this.buffers.get(arraybuffer);
  }

  createBuffer(data: ArrayBuffer, useForIndex: boolean, version: number): WebGLBuffer {
    const gl = this.renderer.gl;
    const buffer = gl.createBuffer();
    if (buffer === null) {
      throw 'webgl buffer create fail';
    }
    if (useForIndex) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
    this.buffers.set(data, buffer);
    this.bufferVersion.set(data, version);
    return buffer;
  }

  disposeBuffer(data: ArrayBuffer) {
    if (!this.buffers.has(data)) {
      throw 'cant find buffer to dispose';
    }
    const gl = this.renderer.gl;
    const buffer = this.buffers.get(data);
    if (buffer === undefined) {
      return
    }
    gl.deleteBuffer(buffer);
    this.buffers.delete(data);
    this.bufferVersion.delete(data);
  }

  updateOrCreateBuffer(
    data: ArrayBuffer,
    useForIndex: boolean,
    version: number): WebGLBuffer {
    
    const webglBuffer = this.buffers.get(data);
    if (webglBuffer === undefined) {
      return this.createBuffer(data, useForIndex, version);
    }

    if (version !== this.bufferVersion.get(data)) {
      this.disposeBuffer(data);
      return this.createBuffer(data, useForIndex, version);
    }

    return webglBuffer;
  }

  releaseGL() {
    this.buffers = new WeakMap();
  }

}