
/**
 * wrap class for uniform change cache and needupdate optimize
 *
 * @export
 * @class UniformProxy
 */
export class UniformProxy{
  constructor(value:any) {
    this._value = value;
  }

  _value: any;
  // _needUpdate is ignored by global uniform uploading
  _needUpdate: boolean = true;

  setValue(val: any) {
    this._value = val;
    this._needUpdate = true;
  }

  setValueNeedUpdate() {
    this._needUpdate = true;
  }

  get value() {
    return this._value;
  }

  resetUpdate() {
    this._needUpdate = false;
  }
}