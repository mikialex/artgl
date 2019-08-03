import { GLRenderer } from "./gl-renderer";
import { GLReleasable } from '../type';

export class GLAttributeBufferDataManager implements GLReleasable {
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

  createInstanceBuffer(data: ArrayBuffer): WebGLBuffer {
    const gl = this.renderer.gl;
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // https://segmentfault.com/a/1190000017048578
    gl.enableVertexAttribArray(aOffsetLocation); // 启用偏移量attribute变量从缓冲区取数据
    gl.vertexAttribPointer(aOffsetLocation, 3, gl.FLOAT, false, 12, 0); // 定义每个数据的长度为3个分量，长度为12 = 3 * 4（浮点数长度）。
    gl.vertexAttribDivisor(aOffsetLocation, 1);

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

  releaseGL() {
    this.buffers = new WeakMap();
  }

}