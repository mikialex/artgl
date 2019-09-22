import { Camera, ProjectionMatrixNeedUpdate } from "../core/camera";
import { Size } from "../engine/render-engine";


export class OrthographicCamera extends Camera {
  constructor(
    near?: number,
    far?: number,
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
  ) {
    super();
    this.zoom = 1;
  
    this.left = ( left !== undefined ) ? left : - 1;
    this.right = ( right !== undefined ) ? right : 1;
    this.top = ( top !== undefined ) ? top : 1;
    this.bottom = ( bottom !== undefined ) ? bottom : - 1;
  
    this.near = ( near !== undefined ) ? near : 0.1;
    this.far = ( far !== undefined ) ? far : 2000;
  
    this.updateProjectionMatrix();
  }

  @ProjectionMatrixNeedUpdate<OrthographicCamera>()
  zoom: number;

  @ProjectionMatrixNeedUpdate<OrthographicCamera>()
  near: number;
  
  @ProjectionMatrixNeedUpdate<OrthographicCamera>()
  far: number;

  @ProjectionMatrixNeedUpdate<OrthographicCamera>()
  left: number;

  @ProjectionMatrixNeedUpdate<OrthographicCamera>()
  right: number;

  @ProjectionMatrixNeedUpdate<OrthographicCamera>()
  top: number;
  
  @ProjectionMatrixNeedUpdate<OrthographicCamera>()
  bottom: number;
  
  onRenderResize(size: Size) {
    // todo
    // this.aspect = size.width / size.height;
  }

  updateProjectionMatrix() {
    var dx = ( this.right - this.left ) / ( 2 * this.zoom );
		var dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
		var cx = ( this.right + this.left ) / 2;
		var cy = ( this.top + this.bottom ) / 2;

		var left = cx - dx;
		var right = cx + dx;
		var top = cy + dy;
		var bottom = cy - dy;

		this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );
  }
}
