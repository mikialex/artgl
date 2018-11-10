import { ARTEngine } from "../renderer/render-engine";

export type BufferDataType = Float32Array | Uint16Array ;

export class BufferData{
  constructor() {
  }
  data: BufferDataType;
  shouldUpdate = true;
  storeId: string;

  setIndex(index: number, value: number) {
    this.shouldUpdate = true;
    this.data[index] = value;
  }
  setData(data: BufferDataType) {
    this.shouldUpdate = true;
    this.data = data;
  }

  getGLAttribute(engine: ARTEngine): WebGLBuffer {
    return engine.getGLAttributeBuffer(this);
  }
}

export class Float32BufferData extends BufferData{
  constructor(size: number) {
    super();
    this.data = new Float32Array(size); 
  }

}

export class Uint16BufferData extends BufferData {
  constructor(size: number) {
    super();
    this.data = new Uint16Array(size);
  }
}