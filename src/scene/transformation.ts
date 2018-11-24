import { Matrix4, Euler, Quaternion, Vector3 } from "../math/index";
import { Vector3Observable } from "../math/observable/vector3-observable";

/**
 * Decribe a node's local transformation info.
 * Users can set values and, from getter to get cleaned value
 * not need to update manully. ALl calculation is lazy.
 * @export
 * @class Transformation
 */
export class Transformation{
  constructor() {
    this._position.onChange = () => {
      this.matrixIsDirty = true;
    }
  }
  private _matrix: Matrix4 = new Matrix4();
  private matrixIsDirty = false;

  private _position: Vector3Observable = new Vector3Observable();
  private positionIsDirty = false;

  private _scale: Vector3Observable = new Vector3Observable();
  private scaleIsDirty = false;

  private _rotation: Euler = new Euler();
  private eulerIsDirty = false;

  private _quaternion: Quaternion = new Quaternion();
  private quaternionIsDirty = false;

  public notifyMatrixChange() {
    this.matrixIsDirty = false;
    this.positionIsDirty = true;
    this.scaleIsDirty = true;
    this.eulerIsDirty = true;
    this.quaternionIsDirty = true;
  }

  get matrix(): Matrix4 {
    if (this.matrixIsDirty) {
      
    }
    return this._matrix;
  }

  get position(): Vector3 {
    if (this.positionIsDirty) {
      this._position._x = this._matrix.elements[12];
      this._position._y = this._matrix.elements[13];
      this._position._z = this._matrix.elements[14];
      this.positionIsDirty = false;
    }
    return this.position;
  }

  get scale(): Vector3 {
    if (this.scaleIsDirty) {
      
      this.scaleIsDirty = false;
    }
    return this._scale;
  }

  get rotation(): Euler {
    if (this.eulerIsDirty) {
      
    }
    return this._rotation;
  }

  get quaternion(): Quaternion {
    if (this.quaternionIsDirty) {
      
    }
    return this._quaternion;
  }


}