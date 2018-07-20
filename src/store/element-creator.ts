import { Watcher } from "./watcher";
import { ReactiveStore } from "./reactive-store";

export class ElementCreator {
  constructor() {
    
  }

  registElement(elementConf) {
    this.elementMetaInfos[elementConf.name] = elementConf;
  }

  registComponent(componentsConfig) {
    this.componentMetaInfos[componentsConfig.name] = componentsConfig;
  }

  elementMetaInfos = {};
  componentMetaInfos = {};

  parseRealData(str) {
    
  }

  createElement(conf, datas, parent) {
    const obj = conf.render();
    Object.keys(datas).forEach(key => {
      const data = datas[key];
      if (typeof data !== 'string') { // plain data
        obj[key] = this.parseRealData(data); // Maybe not use
      } else {
        // create att watcher, when function relys denpendency change, auto update new att to scene obj
        const updator = new Watcher({} as ReactiveStore, data, (newVal) => {
          obj[key] = newVal;
        });
      }
    })
    parent.add(obj);
    return obj;
  }

  createComponent(conf, datas, parent) {
    isCollectrRenderDenpendency = true;
    const creator = new Watcher({} as ReactiveStore, conf.render(datas), (newVal) => {
      conf.render(datas)
    });
    isCollectrRenderDenpendency = false;

    const obj = conf.render();
    Object.keys(datas).forEach(key => {
      const data = datas[key];
      if (typeof data !== 'string') { // plain data
        obj[key] = this.parseRealData(data); // Maybe not use
      } else {
        // create att watcher, when function relys denpendency change, auto update new att to scene obj
        const updator = new Watcher({} as ReactiveStore, data, (newVal) => {
          conf.render(datas)
        });
      }
    })
  }
  
  createScene(tag, datas, parent) {
    let obj;
    if (this.elementMetaInfos[tag] !== undefined) { // render primitive element
      obj = this.createElement(this.elementMetaInfos[tag], datas, parent);
    } else {
      obj = this.createComponent(this.componentMetaInfos[tag], datas, parent);
    }
    return obj;
  }
}

declare var THREE: any;
const creator = new ElementCreator();
creator.registElement({
  name: 'object3D',
  render: () => {
    return new THREE.Object3D;
  }
})
creator.registComponent({
  name: 'MyComponent',
  render: () => {
    if (store.a === true) {
      return h('object3D', null);
    } else {
      return null;
    }
  }
})


let root = new THREE.Scene();
let parent = root;
let isCollectrRenderDenpendency = false;
export function h(tag, data, ...rest) {
  if (isCollectrRenderDenpendency) {
    return null
  }
  creator.createScene(tag, data, parent);
  rest.forEach(child => {
    // if (child === h) { // WTF
    //   child();
    // } else {
      
    // }
  })
}

const template =
  h(
    "scene",
    null,
    h(
      "obj",
      { a: "sdf", b: cal() },
      h("obj", null)
    ),
    h("obj", null),
    h("obj", null)
  );