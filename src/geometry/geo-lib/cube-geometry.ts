import { StandardGeometry } from "../standard-geometry";
import { Vector3 } from "../../math";

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
  }

  width: number = 1;
  height: number = 1;
  depth: number = 1;
  widthSegments: number = 1;
  heightSegments: number = 1;
  depthSegments: number = 1;

  populate() {
    const position = [];
    position.push()


    // build each side of the box geometry

    this.buildPlane('z', 'y', 'x', - 1, - 1, this.depth, this.height, this.width, this.depthSegments, this.heightSegments, 0); // px
    this.buildPlane('z', 'y', 'x', 1, - 1, this.depth, this.height, -  this.width, this.depthSegments, this.heightSegments, 1); // nx
    this.buildPlane('x', 'z', 'y', 1, 1, this.width, this.depth, this.height, this.widthSegments, this.depthSegments, 2); // py
    this.buildPlane('x', 'z', 'y', 1, - 1, this.width, this.depth, -  this.height, this.widthSegments, this.depthSegments, 3); // ny
    this.buildPlane('x', 'y', 'z', 1, - 1, this.width, this.height, this.depth, this.widthSegments, this.heightSegments, 4); // pz
    this.buildPlane('x', 'y', 'z', - 1, - 1, this.width, this.height, -  this.depth, this.widthSegments, this.heightSegments, 5); // nz
  }

  buildPlane(
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
    materialIndex: number
  ) {
    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;

    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const depthHalf = depth / 2;

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    let vertexCounter = 0;
    let groupCount = 0;

    let ix: number, iy: number;

    const vector = new Vector3();

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

        // counters
        vertexCounter += 1;

      }
    }
  }

}