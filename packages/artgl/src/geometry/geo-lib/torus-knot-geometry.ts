
import { Vector3 } from '../../math/index';
import { StandardGeometry } from '../standard-geometry';
import { ShapeWillChange } from '../../core/geometry';


export class TorusKnotGeometry extends StandardGeometry {
  constructor(
    radius?: number,
    tube?: number,
    tubularSegments?: number,
    radialSegments?: number,
    p?: number, q?: number
  ) {
    super();
    this.radius = radius !== undefined ? radius : 1;
    this.tube = tube !== undefined ? tube : 0.4;
    this.tubularSegments = tubularSegments !== undefined ? tubularSegments : 64;
    this.radialSegments = radialSegments !== undefined ? radialSegments : 8;
    this.p = p !== undefined ? p : 2;
    this.q = q !== undefined ? q : 3;
    p = p || 2;
    q = q || 3;

    this.buildShape();
  }

  @ShapeWillChange
  radius = 1;

  @ShapeWillChange
  tube = 0.4;

  @ShapeWillChange
  tubularSegments = 64;

  @ShapeWillChange
  radialSegments = 8;

  @ShapeWillChange
  p = 2

  @ShapeWillChange
  q = 3


  shape() {
    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // helper variables

    let i, j;

    const vertex = new Vector3();
    const normal = new Vector3();

    const P1 = new Vector3();
    var P2 = new Vector3();

    const B = new Vector3();
    const T = new Vector3();
    const N = new Vector3();

    // generate vertices, normals and uvs
    for (i = 0; i <= this.tubularSegments; ++i) {

      // the radian "u" is used to calculate the position on the torus curve of the current tubular segement
      const u = i / this.tubularSegments * this.p * Math.PI * 2;

      // now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
      // these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions
      calculatePositionOnCurve(u, this.p, this.q, this.radius, P1);
      calculatePositionOnCurve(u + 0.01, this.p, this.q, this.radius, P2);

      // calculate orthonormal basis
      T.subVectors(P2, P1);
      N.addVectors(P2, P1);
      B.crossVectors(T, N);
      N.crossVectors(B, T);

      // normalize B, N. T can be ignored, we don't use it
      B.normalize();
      N.normalize();

      for (j = 0; j <= this.radialSegments; ++j) {
        // now calculate the vertices. they are nothing more than an extrusion of the torus curve.
        // because we extrude a shape in the xy-plane, there is no need to calculate a z-value.
        const v = j / this.radialSegments * Math.PI * 2;
        const cx = - this.tube * Math.cos(v);
        const cy = this.tube * Math.sin(v);

        // now calculate the final vertex position.
        // first we orient the extrusion with our basis vectos, then we add it to the current position on the curve
        vertex.x = P1.x + (cx * N.x + cy * B.x);
        vertex.y = P1.y + (cx * N.y + cy * B.y);
        vertex.z = P1.z + (cx * N.z + cy * B.z);

        vertices.push(vertex.x, vertex.y, vertex.z);

        // normal (P1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)
        normal.subVectors(vertex, P1).normalize();
        normals.push(normal.x, normal.y, normal.z);

        // uv
        uvs.push(i / this.tubularSegments);
        uvs.push(j / this.radialSegments);

      }

    }

    // generate indices

    for (j = 1; j <= this.tubularSegments; j++) {
      for (i = 1; i <= this.radialSegments; i++) {

        // indices
        const a = (this.radialSegments + 1) * (j - 1) + (i - 1);
        const b = (this.radialSegments + 1) * j + (i - 1);
        const c = (this.radialSegments + 1) * j + i;
        const d = (this.radialSegments + 1) * (j - 1) + i;

        // faces
        indices.push(a, b, d);
        indices.push(b, c, d);

      }
    }

    this.create(indices, vertices, normals, uvs);

  }

}

function calculatePositionOnCurve(u: number, p: number, q: number, radius: number, position: Vector3) {

  var cu = Math.cos(u);
  var su = Math.sin(u);
  var quOverP = q / p * u;
  var cs = Math.cos(quOverP);

  position.x = radius * (2 + cs) * 0.5 * cu;
  position.y = radius * (2 + cs) * su * 0.5;
  position.z = radius * Math.sin(quOverP) * 0.5;

}
