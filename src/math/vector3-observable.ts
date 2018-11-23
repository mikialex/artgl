import { Vector3 } from "./vector3";

export class Vector3Observable extends Vector3{
  constructor(x?: number, y?: number, z?: number) {
    super();
    this._x = x;
    this._y = y;
    this._z = z;
  }

  onChange = () => { };

  _x;
  _y;
  _z;

  get x() {
    return this._x;
  }
  set x(val) {
    if (this.onChange) {
      this.onChange();
    }
    
    this._x = val;
  }

  get y() {
    return this._y;
  }
  set y(val) {
    if (this.onChange) {
      this.onChange();
    }
    this._y = val;
  }

  get z() {
    return this._z;
  }
  set z(val) {
    if (this.onChange) {
      this.onChange();
    }
    this._z = val;
  }

}
