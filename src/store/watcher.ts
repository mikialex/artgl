import { DataObserver } from "./observer";
import { ReactiveStore } from "./reactive-store";

let gId = 0;
// watch a func exper, when its dependency change , eval func and exe updatecallback  
// dependency collect is via DataObserver.target
export class Watcher{
  constructor(func, callback) {
    this.func = func;
    this.callback = callback;
    this.id = gId++;
    this.execute(); // get inital value, 
    //you cant determine a func's depencency by execute once, maybe use decorator to specify
  }
  id;
  value;
  func;
  callback;

  observers = [];
  // we may exam whether a func is rely reactive data
  // we can create a watcher , check it isARealWatcher.
  // if false, we may not need this watcher, because this func is not reactive
  get isARealWatcher() {
    return this.observers.length > 0;
  }

  execute() {
    DataObserver.target = this;
    this.value = this.func();
    DataObserver.target = null;
  }

  update() {
    const oldVal = this.value;
    this.execute();
    const newVal = this.value;
    if (newVal !== oldVal) {
      this.callback(newVal, oldVal);
    }
  }

}

