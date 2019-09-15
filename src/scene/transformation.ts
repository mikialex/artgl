import { Matrix4, Euler, Quaternion, Vector3 } from "../math/index";
import { Vector3Observable } from "../math/observable/vector3-observable";

const tempVector3 = new Vector3();
const tempMatrix = new Matrix4();

/**
 * Describe a node's local transformation info.
 * Users can set values and, from getter to get cleaned value
 * not need to update manually. All calculation is lazy.
 * @export
 * @class Transformation
 */
export class Transformation{
  constructor() {
    this._position.onChange = () => {
      this.matrixIsDirty = true;
      this.matrixInverseDirty = true;
      this.transformChanged = true;
    }

    this._scale.onChange = () => {
      this.matrixIsDirty = true;
      this.matrixInverseDirty = true;
      this.transformChanged = true;
    }

    this._rotation.onChangeCallback = () => {
      this.matrixIsDirty = true;
      this.matrixInverseDirty = true;
      this.transformChanged = true;
      this._quaternion.setFromEuler(this._rotation, false);
    }

    this._quaternion.onChangeCallback = () => {
      this.matrixIsDirty = true;
      this.transformChanged = true;
      this.matrixInverseDirty = true;
      this._rotation.setFromQuaternion(this._quaternion, this._rotation.order, false);
    }
  }

  transformChanged: boolean = true;

  private _matrix: Matrix4 = new Matrix4();
  private matrixIsDirty = true;

  private _matrixInverse: Matrix4 = new Matrix4();
  private matrixInverseDirty = true;

  private _position: Vector3Observable = new Vector3Observable();
  private positionIsDirty = false;

  private _scale: Vector3Observable = new Vector3Observable(1, 1, 1);
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
    this.matrixInverseDirty = true;
    this.transformChanged = true;
  }

  get matrix(): Matrix4 {
    if (this.matrixIsDirty) {
      this._matrix.compose(this._position, this._quaternion, this._scale);
    }
    return this._matrix;
  }

  get inverseMatrix(): Matrix4{
    if (this.matrixInverseDirty) {
      this._matrixInverse.getInverse(this.matrix, false);
    }
    return this._matrixInverse;
  }

  get position(): Vector3 {
    if (this.positionIsDirty) {
      this._position._x = this._matrix.elements[12];
      this._position._y = this._matrix.elements[13];
      this._position._z = this._matrix.elements[14];
      this.positionIsDirty = false;
    }
    return this._position;
  }

  get scale(): Vector3 {
    if (this.scaleIsDirty) {
      tempVector3.set(this._matrix.elements[0], this._matrix.elements[1], this._matrix.elements[2])
      this._scale._x = tempVector3.length();
      tempVector3.set(this._matrix.elements[4], this._matrix.elements[5], this._matrix.elements[6])
      this._scale._x = tempVector3.length();
      tempVector3.set(this._matrix.elements[8], this._matrix.elements[9], this._matrix.elements[10])
      this._scale._x = tempVector3.length();
      this.scaleIsDirty = false;
    }
    return this._scale;
  }

  get rotation(): Euler {
    if (this.eulerIsDirty) {
      this._rotation.setFromQuaternion(this.quaternion, Euler.defaultOrder, false);
      this.eulerIsDirty = false;
    }
    return this._rotation;
  }

  get quaternion(): Quaternion {
    if (this.quaternionIsDirty) {
      tempMatrix.copy(this._matrix);
      tempMatrix.scale(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z);
      this._quaternion.setFromRotationMatrix(tempMatrix);
      this.quaternionIsDirty = false;
    }
    return this._quaternion;
  }

  copy(other: Transformation) {
    this.transformChanged = true;

    this._matrix.copy(other._matrix);
    this.matrixIsDirty = other.matrixIsDirty;
  
    this._matrixInverse.copy(other._matrixInverse);
    this.matrixInverseDirty = other.matrixInverseDirty;
  
    this._position.copy(other._position);
    this.positionIsDirty = other.positionIsDirty;
  
    this._scale.copy(other._scale);
    this.scaleIsDirty = other.scaleIsDirty;
  
    this._rotation.copy(other._rotation);
    this.eulerIsDirty = other.eulerIsDirty;
  
    this._quaternion.copy(other._quaternion);
    this.quaternionIsDirty = other.quaternionIsDirty;
    return this;
  }
}