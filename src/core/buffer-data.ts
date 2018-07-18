
type BufferDataType = Float32Array | Int32Array ;

export class BufferData{
  constructor() {
  }
  data: BufferDataType;

  setIndex(index: number, value: number) {
    this.data[index] = value;
  }
  setData(data: BufferDataType) {
    this.data = data;
  }
}

export class Float32BufferData extends BufferData{
  constructor(size: number) {
    super();
    this.data = new Float32Array(size); 
  }

}

export class Int32BufferData extends BufferData {
  constructor(size: number) {
    super();
    this.data = new Int32Array(size);
  }
}