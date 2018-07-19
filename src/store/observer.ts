import { ReactiveStore } from "./reactive-store";
import { Watcher } from "./watcher";

interface ObserverConfig {
  name: string;
  isGetter: boolean;
  getterFunc?: Function;
}

let gId = 0;
export class DataObserver {
  constructor(store: ReactiveStore, conf: ObserverConfig) {
    this.store = store;
    this.id = gId++;
    this.name = conf.name;
    this.isGetter = conf.isGetter;
    if (this.isGetter) {
      this.getterFunc = conf.getterFunc;
    }
  }
  id;
  name;
  realValue;
  store: ReactiveStore;
  
  // other data dependencies this data rely
  dependency: DataObserver[] = [];

  // watchers that watch this data
  watchers: Watcher[] = [];
  userWatchers = [];

  isGetter = false;
  getterFunc;
  isDirty = false;

  watch(callBack) {
    if (this.watchers.indexOf(callBack) === -1) {
      this.watchers.push(callBack);
    }
  }
  unwatch(callBack) {
    const index = this.watchers.indexOf(callBack);
    if (index === -1) {
      this.watchers.splice(index, 1);
    }
  }

  setValue(value) {
    if (this.isGetter) {
      throw 'cant set value';
    }
    if (value !== this.realValue) {
      const oldValue = this.realValue;
      this.realValue = value;
      this.watchers.forEach(watchCallback => {
        watchCallback(value, oldValue);
      });
    }
  }
  updateValue() {
    if (this.isGetter) {
      console.log('eval getter ' + this.name);
      this.realValue = this.getterFunc();
      this.isDirty = false;
    }
    return this.realValue;
  }
  getValue() {
    if (this.isDirty) {
      this.updateValue();
    }
    return this.realValue;
  }
}
