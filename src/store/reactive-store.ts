
interface ObserverConfig{
  name: string,
  isGetter: boolean,
  getterFunc?: Function,
}

interface ReactiveStoreConfig{
  states: { [index: string]: any },
  getters: { [index: string]: any },
  watchers: any
}

class DataObserver {
  constructor(store: ReactiveStore, conf: ObserverConfig) {
    this.store = store;
    this.name = conf.name;
    this.isGetter = conf.isGetter;
    if (this.isGetter) {
      this.getterFunc = conf.getterFunc;
    }
  }
  name;
  realValue;
  store: ReactiveStore;
  watchers = [];

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
    if (value !== this.realValue) {
      this.realValue = value;
      this.watchers.forEach(watchCallback => {
        watchCallback(value);
      });
    }
  }
  updateValue() {
    if (this.isGetter) {
      console.log('eval getter ' + this.name)
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

export class ReactiveStore {
  constructor(storeConfig: ReactiveStoreConfig) {
    const self = this;
    Object.keys(storeConfig.states).forEach(stateKey => {
      const observer = new DataObserver(this, {
        name: stateKey,
        isGetter: false
      });
      observer.setValue(storeConfig.states[stateKey]);
      this.observers[stateKey] = observer;
      Object.defineProperty(this.states, stateKey, {
        enumerable: true,
        get: function () {
          if (self.isCollectDenpendency && self.dependencyList.indexOf(stateKey) === -1) {
            self.dependencyList.push(stateKey);
          }
          return self.observers[stateKey].getValue();
        },
        set: function (value) {
          self.observers[stateKey].setValue(value);
        }
      })
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
      })
    })

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
      })
    })
    let i = 1;
    Object.keys(this.getters).forEach(key => {
      Object.defineProperty(this.env, key, {
        get: function () {
          return self.getters[key];
        },
      })
    })

    // rebind
    Object.keys(this.observers).forEach(key => {
      const obs = this.observers[key];
      if (obs.isGetter) {
        obs.getterFunc = obs.getterFunc.bind(this.env);
      }
    });

    Object.keys(storeConfig.getters).forEach(getterKey => { 
      this.collectDependency(this.observers[getterKey]);
    })

  }

  collectDependency(dataOb: DataObserver) {
    if (!dataOb.isGetter) return;
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
  env: any = {a:1};


}

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
