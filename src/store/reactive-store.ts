
class DataObserver {
  constructor(store, name) {
    this.store = store;
    this.name = name;
  }
  name;
  realValue;
  store: ReactiveStore;
  watchers = [];

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
  getValue() {
    return this.realValue;
  }
}

export class ReactiveStore {
  constructor(storeConfig) {
    let isCollectDenpendency = false;
    let dependencyList = [];
    const self = this;
    Object.keys(storeConfig.state).forEach(stateKey => {
      const observer = new DataObserver(this, stateKey);
      observer.setValue(storeConfig.state[stateKey]);
      this.observers[stateKey] = observer;
      Object.defineProperty(this.states, stateKey, {
        get: function () {
          if (isCollectDenpendency && dependencyList.indexOf(stateKey) === -1) {
            dependencyList.push(stateKey);
          }
          return self.observers[stateKey].getValue();
        },
        set: function (value) {
          self.observers[stateKey].setValue(value);
        }
      })
    });

    isCollectDenpendency = true;
    Object.keys(storeConfig.getters).forEach(getterKey => {
      const getterhandlers = {
        isDirty: false,
        value: undefined,
        func: storeConfig.getters[getterKey].bind(this.states)
      }
      this.getterhandlers[getterKey] = getterhandlers;
      dependencyList = [];
      this.getterhandlers[getterKey].value = getterhandlers.func();
      dependencyList.forEach(depName => {
        this.observers[depName].watch(() => {
          this.getterhandlers[getterKey].isDirty = true;
        });
      });

      Object.defineProperty(this.getters, getterKey, {
        get: function () {
          if (getterhandlers.isDirty) {
            console.log('eval getters' + getterKey);
            getterhandlers.value = getterhandlers.func();
            getterhandlers.isDirty = false;
          }
          return getterhandlers.value;
        }
      })
    })
    isCollectDenpendency = false;

  }

  collectDependency(name: string) {

  }

  observers: { [index: string]: DataObserver } = {};
  states = {};
  getters = {};
  getterhandlers = {};


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
