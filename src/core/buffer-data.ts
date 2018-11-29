import { ARTEngine } from "../engine/render-engine";

export type BufferDataType = Float32Array | Uint16Array ;

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
  constructor(data: Float32Array) {
    super(data);
  }

}

export class Uint16BufferData extends BufferData {
  constructor(data: Uint16Array) {
    super(data);
  }
}