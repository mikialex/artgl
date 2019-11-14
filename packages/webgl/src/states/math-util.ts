export interface Vector4Like{
  x: number, y: number, z: number, w: number
  
  equals(other: Vector4Like): boolean;
  copy(other: Vector4Like): void;
}


export class Vector4Simple{
  constructor(x?: number, y?: number, z?: number, w?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = (w !== undefined) ? w : 1;
  }
  x = 0;
  y = 0;
  z = 0;
  w = 0;
  
  set(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  copy(v: Vector4Like) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = (v.w !== undefined) ? v.w : 1;
    return this;
  }

  equals(v: Vector4Like) {
    return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
  }
}