import { ARTEngine } from "../engine/render-engine";

export type BufferDataType = Float32Array | Uint16Array | Uint32Array;

/**
 * bufferdata is webglbuffer container
 * 
 * @export
 * @class BufferData
 */
export class BufferData{
  constructor(data: BufferDataType) {
    this.data = data;
  }
  data: BufferDataType;
  stride: number = 1;
  shouldUpdate = true;

  setIndex(index: number, value: number) {
    this.shouldUpdate = true;
    this.data[index * this.stride] = value;
  }

  getIndex(index: number): number {
    this.shouldUpdate = true;
    return this.data[index * this.stride];
  }

  setData(data: BufferDataType) {
    this.shouldUpdate = true;
    this.data = data;
  }

  getGLAttribute(engine: ARTEngine): WebGLBuffer {
    return engine.getGLAttributeBuffer(this);
  }

  getDataSizeByte() {
    return this.data.byteLength;
  }
}
