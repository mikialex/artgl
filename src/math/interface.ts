export interface Vector4Like{
  x: number, y: number, z: number, w: number,
  equals(other: Vector4Like): boolean,
}

export interface Vector3Like{
  x: number, y: number, z: number,
  equals(other: Vector3Like): boolean,
}
