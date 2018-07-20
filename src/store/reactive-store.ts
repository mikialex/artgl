import { DataObserver } from "./observer";
import { Watcher } from "./watcher";


interface ReactiveStoreConfig {
  states: { [index: string]: any };
  getters?: { [index: string]: any };
  watchers?: { [index: string]: Function };
}

export class ReactiveStore {
  constructor(storeConfig: ReactiveStoreConfig) {
    const self = this;

    this.observe(storeConfig.states);

    Object.keys(storeConfig.getters).forEach(getterKey => {
      const getterFunc = storeConfig.getters[getterKey];
      this.createWatcher(getterFunc, () => {});
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
        DataObserver.target && observer.addWatcher(DataObserver.target);
        return self.observers[key].getValue();
      },
      set: function (value) {
        self.observe(value);
        self.observers[key].setValue(value);
      }
    });
    return observer;
  }

  // create watcher from a func
  createWatcher(func, callback) {
    return new Watcher(this, func, callback);
  }

  observers: { [index: string]: DataObserver } = {};
  states = {};
  getters = {};

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
