import { DataObserver } from "./observer";
import { ReactiveStore } from "./reactive-store";

let gId = 0;
export class Watcher{
  constructor(store: ReactiveStore, callback) {
    this.store = store;
    this.callback = callback;
    this.id = gId++;
  }

  store;
  callback;
  id;

  update(newVal, oldVal) {
    this.callback(newVal, oldVal);
  }

}
