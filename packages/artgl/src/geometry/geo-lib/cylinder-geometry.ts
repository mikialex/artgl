import { StandardGeometry } from "../standard-geometry";
import { Vector2, Vector3 } from "@artgl/math";

export class CylinderGeometry extends StandardGeometry {
  constructor() {
    super();
    this.shape();
  }

  radiusTop = 1
  radiusBottom = 1
  height = 1
  radialSegments = 10;
  heightSegments = 1
  openEnded = false;
  thetaStart = 0;
  thetaLength = Math.PI * 2

  shape() {
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // helper variables
    var index = 0;
    var indexArray: number[][] = [];
    var halfHeight = this.height / 2;

    const generateTorso = () => {

      var x, y;
      var normal = new Vector3();
      var vertex = new Vector3();

      // this will be used to calculate the normal
      var slope = (this.radiusBottom - this.radiusTop) / this.height;

      // generate vertices, normals and uvs
      for (y = 0; y <= this.heightSegments; y++) {
        var indexRow = [];
        var v = y / this.heightSegments;

        // calculate the radius of the current row
        var radius = v * (this.radiusBottom - this.radiusTop) + this.radiusTop;
        for (x = 0; x <= this.radialSegments; x++) {

          var u = x / this.radialSegments;
          var theta = u * this.thetaLength + this.thetaStart;
          var sinTheta = Math.sin(theta);
          var cosTheta = Math.cos(theta);

          // vertex
          vertex.x = radius * sinTheta;
          vertex.y = - v * this.height + halfHeight;
          vertex.z = radius * cosTheta;
          vertices.push(vertex.x, vertex.y, vertex.z);

          // normal
          normal.set(sinTheta, slope, cosTheta).normalize();
          normals.push(normal.x, normal.y, normal.z);

          // u
          uvs.push(u, 1 - v);

          // save index of vertex in respective row
          indexRow.push(index++);

        }

        // now save vertices of the row in our index array
        indexArray.push(indexRow);

      }

      // generate indices
      for (x = 0; x < this.radialSegments; x++) {
        for (y = 0; y < this.heightSegments; y++) {
          // we use the index array to access the correct indices
          var a = indexArray[y][x];
          var b = indexArray[y + 1][x];
          var c = indexArray[y + 1][x + 1];
          var d = indexArray[y][x + 1];
          // faces

          indices.push(a, b, d);
          indices.push(b, c, d);

        }
      }

    }

    const generateCap = (top: boolean) => {
      var x, centerIndexStart, centerIndexEnd;

      var uv = new Vector2();
      var vertex = new Vector3();

      var groupCount = 0;

      var radius = (top === true) ? this.radiusTop : this.radiusBottom;
      var sign = (top === true) ? 1 : - 1;

      // save the index of the first center vertex
      centerIndexStart = index;

      // first we generate the center vertex data of the cap.
      // because the geometry needs one set of uvs per face,
      // we must generate a center vertex per face/segment
      for (x = 1; x <= this.radialSegments; x++) {

        // vertex
        vertices.push(0, halfHeight * sign, 0);

        // normal
        normals.push(0, sign, 0);

        // uv
        uvs.push(0.5, 0.5);

        // increase index
        index++;

      }

      // save the index of the last center vertex
      centerIndexEnd = index;

      // now we generate the surrounding vertices, normals and uvs
      for (x = 0; x <= this.radialSegments; x++) {

        var u = x / this.radialSegments;
        var theta = u * this.thetaLength + this.thetaStart;

        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);

        // vertex
        vertex.x = radius * sinTheta;
        vertex.y = halfHeight * sign;
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // normal
        normals.push(0, sign, 0);

        // uv
        uv.x = (cosTheta * 0.5) + 0.5;
        uv.y = (sinTheta * 0.5 * sign) + 0.5;
        uvs.push(uv.x, uv.y);

        // increase index
        index++;

      }

      // generate indices
      for (x = 0; x < this.radialSegments; x++) {
        var c = centerIndexStart + x;
        var i = centerIndexEnd + x;

        if (top === true) {
          // face top
          indices.push(i, i + 1, c);
        } else {
          // face bottom
          indices.push(i + 1, i, c);
        }

        groupCount += 3;
      }

    }

    generateTorso();

    if (this.openEnded === false) {
      if (this.radiusTop > 0) generateCap(true);
      if (this.radiusBottom > 0) generateCap(false);
    }

    this.create(indices, vertices, normals, uvs);

  }

}
