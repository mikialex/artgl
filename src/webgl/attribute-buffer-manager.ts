import { GLRenderer } from "./webgl-renderer";
import { generateUUID } from "../math/uuid";

export class GLAttributeBufferDataManager {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  renderer: GLRenderer;
  buffers: { [index: string]: WebGLBuffer } = {};

  getGLBuffer(storeId: string) {
    return this, this.buffers[storeId];
  }

  createBuffer(data: ArrayBuffer, useForIndex: boolean): string {
    const gl = this.renderer.gl;
    const buffer = gl.createBuffer();
    if (useForIndex) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
    const id = generateUUID();
    this.buffers[id] = buffer;
    return id;
  }

  disposeBuffer(storeId: string) {
    const bufferToDispose = this.buffers[storeId];
    if (!bufferToDispose) {
      throw 'cant find buffer to dispose';
    }
    const gl = this.renderer.gl;
    gl.deleteBuffer(bufferToDispose);
  }

  dispose() {
    const gl = this.renderer.gl;
    Object.keys(this.buffers).forEach(key => {
      const buffer = this.buffers[key];
      gl.deleteBuffer(buffer);
    })
  }

}