import { DataObserver } from "./observer";
import { Watcher } from "./watcher";


interface ReactiveStoreConfig {
  states: { [index: string]: any };
  getters: { [index: string]: any };
  watchers: { [index: string]: Function };
}

export class ReactiveStore {
  constructor(storeConfig: ReactiveStoreConfig) {
    const self = this;
    const getterObserverMap = {};

    Object.keys(storeConfig.states).forEach(stateKey => {
      this.defineReactive(this.states, stateKey);
    });
    Object.keys(storeConfig.getters).forEach(getterKey => {
      const obs = this.defineReactive(this.getters, getterKey);
      getterObserverMap[getterKey] = obs;
    });



    // // merge env
    // this.env = {};
    // Object.keys(this.states).forEach(key => {
    //   Object.defineProperty(this.env, key, {
    //     get: function () {
    //       return self.states[key];
    //     },
    //     set: function (value) {
    //       self.states[key] = value;
    //     }
    //   });
    // });
    // Object.keys(this.getters).forEach(key => {
    //   Object.defineProperty(this.env, key, {
    //     get: function () {
    //       return self.getters[key];
    //     },
    //   });
    // });

    // // rebind
    // Object.keys(this.observers).forEach(key => {
    //   const obs = this.observers[key];
    //   if (obs.isGetter) {
    //     obs.getterFunc = obs.getterFunc.bind(this.env);
    //   }
    // });

    Object.keys(storeConfig.getters).forEach(getterKey => {
      const getter = storeConfig.getters[getterKey];
      this.createGetterWatcher(getterObserverMap[getterKey], getter);
    });

    // Object.keys(storeConfig.watchers).forEach(watcherKey => {
    //   const watcher = storeConfig.watchers[watcherKey];
    //   Object.keys(this.observers).forEach(key => {
    //     const obs = this.observers[key];
    //     if (obs.name === watcherKey) {
    //       obs.watch(watcher.bind(this.env));
    //     }
    //   });
    // });

  }

  defineReactive(obj: any, key: string) {
    const self = this;
    const value = obj[key];
    const observer = new DataObserver(this, {
      name: key,
    });
    observer.setValue((typeof value === 'function')? undefined : value)
    this.observers[observer.id] = observer;
    Object.defineProperty(obj, key, {
      get: function () {
        this.notifyGet(observer);
        return self.observers[key].getValue();
      },
      set: function (value) {
        self.observers[key].setValue(value);
      }
    });
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        // TODO
      } else {
        Object.keys(value).forEach(subKey => {
          this.defineReactive(value, subKey);
        });
      }
    }
    return observer;
  }

  createGetterWatcher(func, observer: DataObserver) {
    const watcher = new Watcher(this, func);
    watcher.findSubscription();
    watcher.applyToGetterObserver(observer);
  }

  collectDependency(watcher: Watcher) {
    this.isCollectDenpendency = true;
    this.dependencyList = [];
    watcher.run();
    this.isCollectDenpendency = false;
    return this.dependencyList;
  }

  notifyGet(observer) {
    if (this.isCollectDenpendency && this.dependencyList.indexOf(observer.name) === -1) {
      this.dependencyList.push(observer);
    }
  }


  isCollectDenpendency = false;
  dependencyList = [];
  observers: { [index: string]: DataObserver } = {};
  states = {};
  getters = {};
  env: any = { a: 1 };

}

(window as any).store = new ReactiveStore({
  states: {
    targetFps: 60,
    fps: 30,
  },
  getters: {
    enableCulling() {
      return this.fps < this.targetFps;
    },
    cullingRatio() {
      if (this.enableCulling) {
        return this.targetFps - this.fps;
      } else {
        return 0;
      }
    }
  },
  watchers: {
    enableCulling(newVal, oldVal) {
      // ...
      console.log('enable changed');
    }
  },
  // mutation: {
  //   updateFps(val) {
  //     this.state.fps = val;
  //   }
  // }
});

// const store = new ReactiveStore({
//   state: {
//     targetFps: 60,
//     fps: 30,
//   },
//   getters: {
//     enableCulling() {
//       return this.fps < this.targetFps;
//     },
//     cullingRatio() {
//       if (this.enableCulling) {
//         return this.targetFps - this.fps;
//       }
//     }
//   },
//   watcher: {
//     enableCulling(newVal, oldVal) {
//       // ...
//     }
//   },
//   // mutation: {
//   //   updateFps(val) {
//   //     this.state.fps = val;
//   //   }
//   // }
// });


// 
// if(viewer.config.getters.enableCulling)...

// viewer.config.on(...)
// viewer.config.off(...)

// function updateEnableCullingWhenFPSChange(value) {
//   // this.config.getValue(..., ...);
//   // this.config.setValue(..., ...);
// }
// function updateEnableCullingWhenTargetChange(value) {
//   //...
// }

// this.config.addValueListener('fps', updateEnableCullingWhenFPSChange);
// this.config.addValueListener('targetFps', updateEnableCullingWhenTargetChange);
