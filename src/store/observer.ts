import { ReactiveStore } from "./reactive-store";
import { Watcher } from "./watcher";

let gId = 0;
export class DataObserver {
  constructor(store: ReactiveStore) {
    this.store = store;
    this.id = gId++;
  }
  id;
  realValue;
  store: ReactiveStore;
  
  // watchers that watch this data
  watchers: Watcher[] = [];
  userWatchers = [];
  
  // value update watcher
  updateWatcher: Watcher;

  isDirty = false;

  addWatcher(watcher: Watcher) {
    if (this.watchers.indexOf(watcher) === -1) {
      this.watchers.push(watcher);
    }
  }
  removeWatcher(watcher: Watcher) {
    this.watchers = this.watchers.filter(wa => wa.id === watcher.id);
  }

  get isGetter() {
    return this.updateWatcher !== undefined;
  }

  setValue(value) {
    if (this.isGetter) {
      throw 'cant set value';
    }
    if (value !== this.realValue) {
      const oldValue = this.realValue;
      this.realValue = value;
      this.watchers.forEach(watcher => {
        watcher.update(value, oldValue);
      });
    }
  }
  // updateValue() {
  //   if (this.isGetter) {
  //     console.log('eval getter ' + this.name);
  //     this.realValue = this.updateWatcher.run();
  //     this.isDirty = false;
  //   }
  //   return this.realValue;
  // }
  getValue() {
    if (this.isDirty) {
      // this.updateValue();
    }
    return this.realValue;
  }
}
