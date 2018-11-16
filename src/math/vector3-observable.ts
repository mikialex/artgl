import { Vector3 } from "./vector3";


export class Vector3Observable extends Vector3{
  constructor(x?: number, y?: number, z?: number) {
    super();

    const innerVector3 = new Vector3(x, y, z);
    Object.defineProperty(innerVector3, 'x', {
      get: function () {
        
      },
      set: function (val: number) {
        this.onChange();
        this.x = val;
      }
    })
  }

  // static create(vector: Vector3): Vector3Observable {
    
  // }

  innerVector3;

  onChange;

  get x() {
    return this.innerVector3.x;
  }
  set x(val) {
    this.innerVector3.x = val;
  }

  get y() {
    return this.innerVector3.y;
  }
  set y(val) {
    this.innerVector3.y = val;
  }

  get z() {
    return this.innerVector3.z;
  }
  set z(val) {
    this.innerVector3.z = val;
  }

}