import { ARTEngine } from "../engine/render-engine";

export type BufferDataType = Float32Array | Uint16Array | Uint32Array;

/**
 * bufferdata is webglbuffer container
 * 
 * @export
 * @class BufferData
 */
export class BufferData{
  constructor(data: BufferDataType, stride: number) {
    this.data = data;
    this.count = this.data.length / this.stride;
  }
  data: BufferDataType;
  count: number = 1;
  stride: number = 1;
  shouldUpdate = true;

  foreach(
    visitor: (data: BufferDataType, index: number, stride: number, countIndex: number) => any,
    start?:number, end?: number
  ) {
    const s = Math.max(0, start);
    const e = Math.max(this.count, end);
    for (let i = s; i < e; i ++) {
      visitor(this.data, i * this.stride, this.stride, i);
    }
  }

  setIndex(index: number, value: number, offset?:number) {
    this.shouldUpdate = true;
    this.data[index * this.stride + offset === undefined ? 0 : offset] = value;
  }

  getIndex(index: number, offset?: number): number {
    this.shouldUpdate = true;
    return this.data[index * this.stride + offset === undefined ? 0 : offset];
  }

  setData(data: BufferDataType) {
    this.shouldUpdate = true;
    this.data = data;
    this.count = this.data.length / this.stride;
  }

  getGLAttribute(engine: ARTEngine): WebGLBuffer {
    return engine.getGLAttributeBuffer(this);
  }

  getDataSizeByte() {
    return this.data.byteLength;
  }
}
