export interface Vector4Like{
  x: number, y: number, z: number, w: number,
  equals(other: Vector4Like): boolean,
  copy(other: Vector4Like): Vector4Like;
}

export interface Vector3Like{
  x: number, y: number, z: number,
  equals(other: Vector3Like): boolean,
  copy(other: Vector3Like): Vector3Like;
}
