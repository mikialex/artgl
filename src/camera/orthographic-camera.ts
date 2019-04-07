import { Camera } from "../core/camera";


export class OrthographicCamera extends Camera {
  constructor(
    near: number,
    far: number,
    left: number,
    right: number,
    top: number,
    bottom: number,
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

  zoom: number;
  near: number;
  far: number;

  left: number;
  right: number;
  top: number;
  bottom: number;
  
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