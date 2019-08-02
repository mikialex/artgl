
import { Vector3 } from '../../math/index';
import { StandardGeometry } from '../standard-geometry';


export class SphereGeometry extends StandardGeometry {
  constructor(radius?: number, widthSegments?: number, heightSegments?: number,
    phiStart?: number, phiLength?: number, thetaStart?: number, thetaLength?: number) {
    super();
    this.radius = radius !== undefined ? radius : 1;
    this.widthSegments = Math.max(3, Math.floor(widthSegments) || 8);
    this.heightSegments = Math.max(2, Math.floor(heightSegments) || 6);
    this.phiStart = phiStart !== undefined ? phiStart : 0;
    this.phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;
    this.thetaStart = thetaStart !== undefined ? thetaStart : 0;
    this.thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;
    this.thetaEnd = this.thetaStart + this.thetaLength;

    this.buildShape();
  }
  name = 'SphereGeometry'
  radius = 1;
  widthSegments = 10;
  heightSegments = 10;
  phiStart = 0;
  phiLength = Math.PI * 2;
  thetaStart = 0;
  thetaLength = Math.PI * 2;
  thetaEnd: number;

  shape() {

    let ix: number, iy: number;
    let index = 0;
    let grid = [];
    let vertex = new Vector3(0, 0, 0);
    let normal = new Vector3(0, 0, 0);

    // buffers

    let indices = [];
    let vertices = [];
    let normals = [];
    let uvs = [];

    for (iy = 0; iy <= this.heightSegments; iy++) {
      let verticesRow = [];
      let v = iy / this.heightSegments;
      for (ix = 0; ix <= this.widthSegments; ix++) {
        let u = ix / this.widthSegments;
        // vertex
        vertex.x = - this.radius * Math.cos(this.phiStart + u * this.phiLength) * Math.sin(this.thetaStart + v * this.thetaLength);
        vertex.y = this.radius * Math.cos(this.thetaStart + v * this.thetaLength);
        vertex.z = this.radius * Math.sin(this.phiStart + u * this.phiLength) * Math.sin(this.thetaStart + v * this.thetaLength);
        vertices.push(vertex.x, vertex.y, vertex.z);
        // normal
        normal.set(vertex.x, vertex.y, vertex.z).normalize();
        normals.push(normal.x, normal.y, normal.z);
        // uv
        uvs.push(u, 1 - v);
        verticesRow.push(index++);
      }
      grid.push(verticesRow);
    }

    // indices
    for (iy = 0; iy < this.heightSegments; iy++) {
      for (ix = 0; ix < this.widthSegments; ix++) {
        let a = grid[iy][ix + 1];
        let b = grid[iy][ix];
        let c = grid[iy + 1][ix];
        let d = grid[iy + 1][ix + 1];
        if (iy !== 0 || this.thetaStart > 0) indices.push(a, b, d);
        if (iy !== this.heightSegments - 1 || this.thetaEnd < Math.PI) indices.push(b, c, d);
      }
    }

    this.create(indices, vertices, normals, uvs);

  }

}
