import { RenderEngine } from "../engine/render-engine";
export type BufferDataType = Float32Array | Uint16Array | Uint32Array;

/**
 * BufferData is a container for webglBuffer.
 * Provided some convenient methods for data manipulating
 */
export class BufferData{
  static f3(data: number[]): BufferData {
    return new BufferData(new Float32Array(data), 3)
  }
  static f2(data: number[]): BufferData {
    return new BufferData(new Float32Array(data), 2)
  }
  static u32Index(data: number[]): BufferData {
    return new BufferData(new Uint32Array(data), 1)
  }

  constructor(data: BufferDataType, stride: number) {
    this.data = data;
    this.stride = stride;
  }
  data: BufferDataType;
  stride: number = 1;
  dataChanged = true;

  get count() {
    return this.data.length / this.stride;
  }

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

  setIndex(index: number, value: number, offset:number) {
    this.dataChanged = true;
    this.data[index * this.stride + offset] = value;
  }

  getIndex(index: number, offset: number): number {
    return this.data[index * this.stride + offset];
  }

  setData(data: BufferDataType) {
    this.dataChanged = true;
    this.data = data;
  }

  getGLAttribute(engine: RenderEngine): WebGLBuffer {
    return engine.getGLAttributeBuffer(this);
  }

  getDataSizeByte() {
    return this.data.byteLength;
  }
}

export class InstancedBufferData extends BufferData{
  constructor(data: BufferDataType, stride: number, divisor: number) {
    super(data, stride);
    this.divisor = divisor;
  }

  divisor: number = 1;
}