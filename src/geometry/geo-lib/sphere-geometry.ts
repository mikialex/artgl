
import { Geometry } from '../../core/geometry';
import { Vector3 } from '../../math/index';
import { AttributeUsage } from '../../webgl/attribute';
import { Float32BufferData, Uint16BufferData } from '../../core/buffer-data';


export class SphereGeometry extends Geometry {
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

    this.layout = {
      dataInfo: {
        index: {
          usage: AttributeUsage.index,
          stride: 1
        },
        position: {
          usage: AttributeUsage.position,
          stride: 3
        },
        normal: {
          usage: AttributeUsage.normal,
          stride: 3
        }
      },
      drawFrom: 0,
      drawCount: 36,
      indexDraw: true
    }
    this.populate();
  }
  radius = 1;
  widthSegments = 10;
  heightSegments = 10;
  phiStart = 0;
  phiLength = Math.PI * 2;
  thetaStart = 0;
  thetaLength = Math.PI * 2;
  thetaEnd: number;

  populate() {

    let ix, iy;
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

    const positionBuffer = new Float32BufferData(new Float32Array(vertices));
    this.bufferDatas.position = positionBuffer;

    const normalBuffer = new Float32BufferData(new Float32Array(normals));
    this.bufferDatas.normal = normalBuffer;

    const indexBuffer = new Uint16BufferData(new Uint16Array(indices));
    this.bufferDatas.index = indexBuffer;
    this.layout.drawCount = indices.length;

  }


}


//   let ix, iy;

//   let index = 0;
//   let grid = [];

//   let vertex = new Vector3();
//   let normal = new Vector3();

//   // buffers

//   let indices = [];
//   let vertices = [];
//   let normals = [];
//   let uvs = [];

//   // generate vertices, normals and uvs

//   for (iy = 0; iy <= heightSegments; iy++) {
//     let verticesRow = [];
//     let v = iy / heightSegments;
//     for (ix = 0; ix <= widthSegments; ix++) {
//       let u = ix / widthSegments;
//       // vertex
//       vertex.x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
//       vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
//       vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
//       vertices.push(vertex.x, vertex.y, vertex.z);
//       // normal
//       normal.set(vertex.x, vertex.y, vertex.z).normalize();
//       normals.push(normal.x, normal.y, normal.z);
//       // uv
//       uvs.push(u, 1 - v);
//       verticesRow.push(index++);
//     }
//     grid.push(verticesRow);
//   }

//   // indices

//   for (iy = 0; iy < heightSegments; iy++) {
//     for (ix = 0; ix < widthSegments; ix++) {
//       let a = grid[iy][ix + 1];
//       let b = grid[iy][ix];
//       let c = grid[iy + 1][ix];
//       let d = grid[iy + 1][ix + 1];
//       if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
//       if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
//     }
//   }

//   // build geometry

//   this.setIndex(indices);
//   this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
//   this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
//   this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

// }
