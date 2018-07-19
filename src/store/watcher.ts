import { DataObserver } from "./observer";
import { ReactiveStore } from "./reactive-store";

let gId = 0;
export class Watcher{
  constructor(store: ReactiveStore, func) {
    this.store = store;
    this.func = func;
    this.id = gId++;
  }

  subscription: { [index: string]: DataObserver } = {};
  hasFindSubscription = false;
  store;
  func;
  id;

  findSubscription() {
    this.subscription = {};
    const dependencyList = this.store.collectDependency(this);
    dependencyList.forEach((dep: DataObserver)=> {
      this.subscription[dep.id] = dep;
      dep.addWatcher(this);
    });
    this.hasFindSubscription = true;
  }

  applyToGetterObserver(obs: DataObserver) {
    obs.updateWatcher = this;
  }

  run(newVal?, oldVal?) {
    this.func(newVal, oldVal);
  }

}