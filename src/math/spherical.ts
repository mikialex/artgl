import { Vector3 } from './vector3';
import { MathUtil } from './util';

export class Spherical {

  public center = new Vector3();

  constructor(public radius?: number, public polar?: number, public azim?: number) {
    this.radius = radius || 1;
    this.polar = polar || 0;
    this.azim = azim || 0;
  }

  public set(radius: number, polar: number, azim: number): Spherical {
    this.radius = radius;
    this.polar = polar;
    this.azim = azim;
    return this;
  }

  public copy(s: Spherical): Spherical {
    return this.set(s.radius, s.polar, s.azim);
  }

  public clone(): Spherical {
    return new Spherical(this.radius, this.polar, this.azim);
  }

  public setFromVector(v: Vector3): Spherical {
    this.radius = v.length();
    if (this.radius === 0) {
      this.polar = 0;
      this.azim = 0;
    } else {
      this.polar = Math.acos(MathUtil.clamp((v.y / this.radius), -1, 1));
      this.azim = Math.atan2(v.x, v.z);
    }
    return this;
  }
}