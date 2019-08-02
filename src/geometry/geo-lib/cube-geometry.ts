import { StandardGeometry } from "../standard-geometry";
import { Vector3 } from "../../math";

// https://github.com/mrdoob/three.js/blob/dev/src/geometries/BoxGeometry.js

export class CubeGeometry extends StandardGeometry {
  constructor(width?: number, height?: number, depth?: number,
    widthSegments?: number, heightSegments?: number, depthSegments?: number) {
    super();
    if (width !== undefined) { this.width = width; }
    if (height !== undefined) { this.height = height; }
    if (depth !== undefined) { this.depth = depth; }
    if (widthSegments !== undefined) { this.widthSegments = widthSegments; }
    if (heightSegments !== undefined) { this.heightSegments = heightSegments; }
    if (depthSegments !== undefined) { this.depthSegments = depthSegments; }

    this.buildShape();
  }

  width: number = 1;
  height: number = 1;
  depth: number = 1;
  widthSegments: number = 1;
  heightSegments: number = 1;
  depthSegments: number = 1;

  shape() {

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    let numberOfVertices = 0;

    function buildPlane(
      u: string,
      v: string,
      w: string,
      udir: number,
      vdir: number,
      width: number,
      height: number,
      depth: number,
      gridX: number,
      gridY: number,
    ) {
      const segmentWidth = width / gridX;
      const segmentHeight = height / gridY;

      const widthHalf = width / 2;
      const heightHalf = height / 2;
      const depthHalf = depth / 2;

      const gridX1 = gridX + 1;
      const gridY1 = gridY + 1;

      let ix: number, iy: number;

      const vector = new Vector3();
      let vertexCounter = 0;

      // generate vertices, normals and uvs

      for (iy = 0; iy < gridY1; iy++) {
        var y = iy * segmentHeight - heightHalf;
        for (ix = 0; ix < gridX1; ix++) {
          var x = ix * segmentWidth - widthHalf;

          // set values to correct vector component
          vector[u] = x * udir;
          vector[v] = y * vdir;
          vector[w] = depthHalf;

          // now apply vector to vertex buffer
          vertices.push(vector.x, vector.y, vector.z);

          // set values to correct vector component
          vector[u] = 0;
          vector[v] = 0;
          vector[w] = depth > 0 ? 1 : - 1;

          // now apply vector to normal buffer
          normals.push(vector.x, vector.y, vector.z);

          // uvs
          uvs.push(ix / gridX);
          uvs.push(1 - (iy / gridY));

          vertexCounter += 1;
        }
      }

      // indices
      // 1. you need three indices to draw a single face
      // 2. a single segment consists of two faces
      // 3. so we need to generate six (2*3) indices per segment
      for (iy = 0; iy < gridY; iy++) {
        for (ix = 0; ix < gridX; ix++) {
          var a = numberOfVertices + ix + gridX1 * iy;
          var b = numberOfVertices + ix + gridX1 * (iy + 1);
          var c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
          var d = numberOfVertices + (ix + 1) + gridX1 * iy;

          // faces
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      numberOfVertices += vertexCounter;
    }

    // build each side of the box geometry

    buildPlane('z', 'y', 'x', - 1, - 1, this.depth, this.height, this.width, this.depthSegments, this.heightSegments); // px
    buildPlane('z', 'y', 'x', 1, - 1, this.depth, this.height, -  this.width, this.depthSegments, this.heightSegments); // nx
    buildPlane('x', 'z', 'y', 1, 1, this.width, this.depth, this.height, this.widthSegments, this.depthSegments); // py
    buildPlane('x', 'z', 'y', 1, - 1, this.width, this.depth, -  this.height, this.widthSegments, this.depthSegments); // ny
    buildPlane('x', 'y', 'z', 1, - 1, this.width, this.height, this.depth, this.widthSegments, this.heightSegments); // pz
    buildPlane('x', 'y', 'z', - 1, - 1, this.width, this.height, -  this.depth, this.widthSegments, this.heightSegments); // nz

    this.create(indices, vertices, normals, uvs);
  }


}