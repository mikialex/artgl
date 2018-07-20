import { DataObserver } from "./observer";
import { Watcher } from "./watcher";


export interface ReactiveStoreConfig {
  states: { [index: string]: any };
  getters?: { [index: string]: any };
  watchers?: { [index: string]: Function };
}

// store makes a data obserable by convert its property to getter setter,
// to send update info to their corespondent dataobserver;
export class ReactiveStore {
  constructor(storeConfig: ReactiveStoreConfig) {
    const self = this;
    this.states = storeConfig.states;

    this.observe(this.states);

    this.createGetterObservers(storeConfig.getters);

  }

  observe(data) {
    if (Array.isArray(data)) {
      // TODO
    }
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
      this.observe(data[key])
    })
  }

  defineReactive(obj: any, key: string, value:any) {
    const self = this;
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

  getterKeyObserverMap = {};
  createGetterObservers(getters) {
    // first, create getters self obs by getterName
    Object.keys(getters).forEach(getterKey => {
      this.getterKeyObserverMap[getterKey] = { obs: this.defineReactive(this.states, getterKey, undefined) };
    });
    // then, make watchers from getter getterFunction
    Object.keys(getters).forEach(getterKey => {
      const observer = this.getterKeyObserverMap[getterKey].obs;
      const getterFunc = getters[getterKey];
      const watcher = new Watcher(getterFunc, (newVal) => {
        observer.setValue(newVal);
      });
      this.getterKeyObserverMap[getterKey].watcher = watcher;
    });
    // TODO getter inital value, fix getter dengpendency eval sequence
    // this can be done by denpendency aly between data obs
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
