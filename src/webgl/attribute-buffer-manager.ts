import { GLRenderer } from "./webgl-renderer";

export class GLAttributeBufferDataManager {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  readonly renderer: GLRenderer;
  private buffers: WeakMap<ArrayBuffer, WebGLBuffer> = new WeakMap();

  getGLBuffer(arraybuffer: ArrayBuffer): WebGLBuffer {
    return this.buffers.get(arraybuffer);
  }

  createBuffer(data: ArrayBuffer, useForIndex: boolean): WebGLBuffer {
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
    return buffer;
  }

  disposeBuffer(data: ArrayBuffer) {
    if (!this.buffers.has(data)) {
      throw 'cant find buffer to dispose';
    }
    const gl = this.renderer.gl;
    const buffer = this.buffers.get(data);
    gl.deleteBuffer(buffer);
    this.buffers.delete(data);
  }

  updateOrCreateBuffer(data: ArrayBuffer, useForIndex: boolean): WebGLBuffer {
    if (!this.buffers.has(data)) {
      return this.createBuffer(data, useForIndex);
    }
    this.disposeBuffer(data);
    this.createBuffer(data, useForIndex);
  }

  dispose() {
    this.buffers = null;
  }

}