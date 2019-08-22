type TypeArray = Float32Array | Uint8Array | Uint16Array | Uint32Array

class AutoGrowTypedArray<T extends TypeArray>{
  static initialLength = 1000;
  buffer: T;

  get capacity() {
    return this.buffer.length;
  }
  _realLength: number = 0;

  get realLength() {
    return this._realLength;
  }

  constructor(constructor: any, length?: number) {
    if (length === undefined) {
      this.buffer = new constructor(AutoGrowTypedArray.initialLength)
    } else {
      this.buffer = new constructor(length)
    }
  }

  push(value: number) {

  }
}

class GeometryBuilder {
  positionBuffer = new AutoGrowTypedArray(Float32Array)
  normalBuffer = new AutoGrowTypedArray(Float32Array)
  uvBuffer = new AutoGrowTypedArray(Float32Array)
  verticesStored: number = 0;

  indexBuffer = new AutoGrowTypedArray(Uint16Array)


  addVertex(x: number, y: number, z: number, nx: number, ny: number, nz: number) {
    this.positionBuffer.push(x);
    this.positionBuffer.push(y);
    this.positionBuffer.push(z);
    this.normalBuffer.push(nx);
    this.normalBuffer.push(ny);
    this.normalBuffer.push(nz);
    this.verticesStored++;
    return this.verticesStored - 1;
  }

  addFace(index1: number, index2: number, index3: number) {
    this.addPoint(index1);
    this.addPoint(index2);
    this.addPoint(index3);
  }

  addPoint(index: number) {
    if (index < this.verticesStored) {
      this.indexBuffer.push(index);
    } else {
      throw "cant reference a index out of stored"
    }
  }

}