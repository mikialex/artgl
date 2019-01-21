export class UniformProxy{
  constructor(value) {
    this._value = value;
  }

  _value: any;
  // TODO needUpdate may relate with program
  needUpdate: boolean = true;

  set value(val: any) {
    this._value = val;
    this.needUpdate = true;
  }

  get value() {
    return this._value;
  }

  resetUpdate() {
    this.needUpdate = false;
  }
}