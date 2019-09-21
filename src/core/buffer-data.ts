import { RenderEngine } from "../engine/render-engine";
export type BufferDataType = Float32Array | Uint16Array | Uint32Array;

/**
 * BufferData is a container for webglBuffer.
 * Provided some convenient methods for data manipulating
 */
export class BufferData<T extends BufferDataType = BufferDataType>{
  static f3(data: number[]): BufferData<Float32Array> {
    return new BufferData(new Float32Array(data), 3)
  }
  static f2(data: number[]): BufferData<Float32Array> {
    return new BufferData(new Float32Array(data), 2)
  }
  static u32Index(data: number[]): BufferData<Uint32Array> {
    return new BufferData(new Uint32Array(data), 1)
  }

  constructor(data: T, stride: number) {
    this.data = data;
    this.stride = stride;
  }
  data: T;
  readonly stride: number;
  _version = 0;

  get count() {
    return this.data.length / this.stride;
  }

  foreach(
    visitor: (data: BufferDataType, index: number, stride: number, countIndex: number) => any,
    start: number = 0, end: number = Number.MAX_VALUE
  ) {
    const e = Math.max(this.count, end);
    const s = Math.min(Math.max(0, start), e);
    for (let i = s; i < e; i++) {
      visitor(this.data, i * this.stride, this.stride, i);
    }
  }

  /** 
   * need call markBufferDataChange later
   */
  setIndex(index: number, value: number, offset: number) {
    this.data[index * this.stride + offset] = value;
  }

  getIndex(index: number, offset: number): number {
    return this.data[index * this.stride + offset];
  }

  setData(data: T) {
    this.markBufferDataChange();
    this.data = data;
  }

  markBufferDataChange() {
    this._version++;
  }

  getGLAttribute(engine: RenderEngine) {
    return engine.getGLAttributeBuffer(this);
  }

  getDataSizeByte() {
    return this.data.byteLength;
  }
}

export class InstancedBufferData extends BufferData {
  constructor(data: BufferDataType, stride: number, divisor: number) {
    super(data, stride);
    this.divisor = divisor;
  }

  divisor: number = 1;
}