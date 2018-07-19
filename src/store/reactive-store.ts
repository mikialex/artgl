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

    this.observe(storeConfig.states);

    Object.keys(storeConfig.states).forEach(stateKey => {
      this.defineReactive(this.states, stateKey);
    });
    Object.keys(storeConfig.getters).forEach(getterKey => {
      const obs = this.defineReactive(this.getters, getterKey);
      getterObserverMap[getterKey] = obs;
    });


    Object.keys(storeConfig.getters).forEach(getterKey => {
      const getter = storeConfig.getters[getterKey];
      this.createGetterWatcher(getterObserverMap[getterKey], getter);
    });

  }

  observe(data) {
    if (Array.isArray(data)) {
      // TODO
    }
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key)
      this.observe(data[key])
    })
  }

  defineReactive(obj: any, key: string) {
    const self = this;
    const value = obj[key];
    const observer = new DataObserver(this);
    observer.setValue((typeof value === 'function')? undefined : value)
    this.observers[observer.id] = observer;
    Object.defineProperty(obj, key, {
      get: function () {
        self.notifyGet(observer);
        return self.observers[key].getValue();
      },
      set: function (value) {
        self.observe(value);
        self.observers[key].setValue(value);
      }
    });
    return observer;
  }

  createGetterWatcher(func, observer: DataObserver) {
    const dependencyList = this.collectDependency(func);
    const getter = new Watcher(this, () => {
      observer.setValue(func());
    });
    dependencyList.forEach((dep: DataObserver) => {
      dep.addWatcher(getter);
    });
  }

  collectDependency(func) {
    this.isCollectDenpendency = true;
    this.dependencyList = [];
    func();
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
