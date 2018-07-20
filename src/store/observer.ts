import { ReactiveStore } from "./reactive-store";
import { Watcher } from "./watcher";

let gId = 0;
export class DataObserver {
  constructor(store: ReactiveStore) {
    this.store = store;
    this.id = gId++;
  }
  static target: Watcher;
  id;
  realValue;
  store: ReactiveStore;
  
  // watchers that watch this data
  watchers: Watcher[] = [];

  addWatcher(watcher: Watcher) {
    if (this.watchers.indexOf(watcher) === -1) {
      this.watchers.push(watcher);
    }
  }
  removeWatcher(watcher: Watcher) {
    this.watchers = this.watchers.filter(wa => wa.id === watcher.id);
  }

  setValue(value) {
    if (value !== this.realValue) {
      const oldValue = this.realValue;
      this.realValue = value;
      this.watchers.forEach(watcher => {
        watcher.update(value, oldValue);
      });
    }
  }
  getValue() {
    return this.realValue;
  }
}
