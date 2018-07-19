import { DataObserver } from "./observer";


interface ReactiveStoreConfig {
  states: { [index: string]: any };
  getters: { [index: string]: any };
  watchers: { [index: string]: Function };
}

export class ReactiveStore {
  constructor(storeConfig: ReactiveStoreConfig) {
    const self = this;
    Object.keys(storeConfig.states).forEach(stateKey => {
      this.defineReactive(this.states, stateKey);
    });


    Object.keys(storeConfig.getters).forEach(getterKey => {
      this.defineReactive(this.getters, getterKey);
    });

    Object.keys(storeConfig.getters).forEach(getterKey => {
      const observer = new DataObserver(this, {
        name: getterKey,
        isGetter: true,
        getterFunc: storeConfig.getters[getterKey]
      });
      this.observers[getterKey] = observer;

      Object.defineProperty(this.getters, getterKey, {
        enumerable: true,
        get: function () {
          if (self.isCollectDenpendency && self.dependencyList.indexOf(getterKey) === -1) {
            self.dependencyList.push(getterKey);
          }
          return observer.getValue();
        }
      });
    });

    // merge env
    this.env = {};
    Object.keys(this.states).forEach(key => {
      Object.defineProperty(this.env, key, {
        get: function () {
          return self.states[key];
        },
        set: function (value) {
          self.states[key] = value;
        }
      });
    });
    Object.keys(this.getters).forEach(key => {
      Object.defineProperty(this.env, key, {
        get: function () {
          return self.getters[key];
        },
      });
    });

    // rebind
    Object.keys(this.observers).forEach(key => {
      const obs = this.observers[key];
      if (obs.isGetter) {
        obs.getterFunc = obs.getterFunc.bind(this.env);
      }
    });

    Object.keys(storeConfig.getters).forEach(getterKey => {
      this.collectDependency(this.observers[getterKey]);
    });

    Object.keys(storeConfig.watchers).forEach(watcherKey => {
      const watcher = storeConfig.watchers[watcherKey];
      Object.keys(this.observers).forEach(key => {
        const obs = this.observers[key];
        if (obs.name === watcherKey) {
          obs.watch(watcher.bind(this.env));
        }
      });
    });

  }

  defineReactive(obj: any, key: string) {
    const self = this;
    const value = obj[key];
    const observer = new DataObserver(this, {
      name: key,
      isGetter: typeof value === 'function'
    });
    observer.setValue(value);
    this.observers[key] = observer;
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
  }

  notifyGet(observer) {
    if (this.isCollectDenpendency && this.dependencyList.indexOf(observer.name) === -1) {
      this.dependencyList.push(observer);
    }
  }

  collectDependency(dataOb: DataObserver) {
    if (!dataOb.isGetter) { return; }
    this.isCollectDenpendency = true;
    this.dependencyList = [];
    dataOb.updateValue();
    this.dependencyList.forEach(depName => {
      this.observers[depName].watch(() => {
        dataOb.isDirty = true;
      });
    });
    this.isCollectDenpendency = false;
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
