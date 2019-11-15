
import { Interactor } from "./interactor";
import { Nullable } from "../..";

export abstract class Controller{

  interactor: Nullable<Interactor> = null;

  private _enabled = true;

  get enabled() {
    return this._enabled;
  }

  set enabled(value: boolean) {
    if (value) {
      this.reloadStates();
    }
    this._enabled = value;
  }

  abstract reloadStates(): void;

  abstract update(): void;
}