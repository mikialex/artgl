import { Matrix4, Vector3 } from "../math";
import { InnerUniformMap } from "../webgl/uniform/uniform";

/**
 * wrap class for uniform change cache and need update optimize
 *
 */
export class UniformProxy<T>{
  constructor(value: T) {
    this._value = value;
  }

  _value: T;
  _needUpdate: boolean = true;

  setValue(val: T) {
    this._value = val;
    this._needUpdate = true;
  }

  setValueNeedUpdate() {
    this._needUpdate = true;
  }

  get value() {
    return this._value;
  }

  resetUpdate() {
    this._needUpdate = false;
  }
}


export interface GlobalUniforms {
  MMatrix: UniformProxy<Matrix4>,
  VPMatrix: UniformProxy<Matrix4>,
  CameraWorldPosition: UniformProxy<Vector3>,
  LastVPMatrix: UniformProxy<Matrix4>
}


export function createAllInnerSupportUniformProxy(): GlobalUniforms {
  return {
    MMatrix: new UniformProxy(InnerUniformMap.get("MMatrix").default),
    VPMatrix: new UniformProxy(InnerUniformMap.get("VPMatrix").default),
    CameraWorldPosition: new UniformProxy(InnerUniformMap.get("CameraWorldPosition").default),
    LastVPMatrix: new UniformProxy(InnerUniformMap.get("LastVPMatrix").default),
  }
}