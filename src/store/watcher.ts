import { DataObserver } from "./observer";
import { ReactiveStore } from "./reactive-store";

let gId = 0;
// watch a func exper, when its dependency change , eval func and exe updatecallback  
// dependency collect is via DataObserver.target
export class Watcher{
  constructor(store: ReactiveStore, func, callback) {
    this.store = store;
    this.func = func;
    this.callback = callback;
    this.id = gId++;
  }
  id;
  store;
  value;
  func;
  callback;

  execute() {
    DataObserver.target = this;
    this.value = this.func();
    DataObserver.target = null;
  }

  update(newVal, oldVal) {
    this.callback(newVal, oldVal);
  }

}
