import { StandardGeometry } from '../standard-geometry';

export class PlaneGeometry extends StandardGeometry {
  constructor(width?: number, height?: number,
    widthSegments?: number, heightSegments?: number) {
    super();

    this.width = width !== undefined ? width : 1;
    this.height = height !== undefined ? height : 1;
    this.widthSegments = widthSegments !== undefined ? widthSegments : 1;
    this.heightSegments = heightSegments !== undefined ? heightSegments : 1;

    this.buildShape();
  }
  name = 'PlaneGeometry'
  width: number;
  height: number;
  widthSegments: number;
  heightSegments: number;

  shape() {

    var width_half = this.width / 2;
    var height_half = this.height / 2;
  
    var gridX = Math.floor( this.widthSegments ) || 1;
    var gridY = Math.floor( this.heightSegments ) || 1;
  
    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;
  
    var segment_width = this.width / gridX;
    var segment_height = this.height / gridY;
  
    var ix, iy;
  
    // buffers
    var indices: number[] = [];
    var vertices: number[] = [];
    var normals: number[] = [];
    var uvs: number[] = [];
  
    // generate vertices, normals and uvs
    for ( iy = 0; iy < gridY1; iy ++ ) {
      var y = iy * segment_height - height_half;
      for ( ix = 0; ix < gridX1; ix ++ ) {
        var x = ix * segment_width - width_half;
        vertices.push( x, - y, 0 );
        normals.push( 0, 0, 1 );
        uvs.push( ix / gridX );
        uvs.push( 1 - ( iy / gridY ) );
      }
    }
  
    // indices
    for ( iy = 0; iy < gridY; iy ++ ) {
      for ( ix = 0; ix < gridX; ix ++ ) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * ( iy + 1 );
        const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
        const d = ( ix + 1 ) + gridX1 * iy;
        // faces
        indices.push( a, b, d );
        indices.push( b, c, d );
      }
    }

    this.create(indices, vertices, normals, uvs);
  }

}
