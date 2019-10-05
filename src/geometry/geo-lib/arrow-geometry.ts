import { StandardGeometry } from "../standard-geometry";

export class ArrowGeometry extends StandardGeometry {
  constructor() {
    super();
    this.shape();
  }

  bottomRadius: number = 1;
  ArrowRadius: number = 2;
  ArrowHeight: number = 2;
  height: number = 3;
  segments: number = 10;

  shape() {
    const position = [];
    const normal = [];
    const uv = [];
    const index = [];

    for (let i = 0; i < this.segments; i++) {
      const theta = i * (Math.PI * 2 / this.segments);
      position.push(Math.sin(theta) * this.bottomRadius, 0, Math.cos(theta) * this.bottomRadius);
      normal.push(0, -1, 0);
      uv.push(0, 0, 0);
    }
    position.push(0, 0, 0);
    normal.push(0, -1, 0);
    uv.push(0, 0, 0);

    for (let i = 0; i < this.segments; i++) {
      const count = i + 1;
      index.push(count)
      index.push(count - 1)
      index.push(this.segments)
    }
    index.push(0)
    index.push(this.segments - 1)
    index.push(this.segments)

    this.create(index, position, normal, uv);
  }

}