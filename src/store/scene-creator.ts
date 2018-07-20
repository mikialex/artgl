import { Watcher } from "./watcher";
import { ReactiveStore } from "./reactive-store";
import { Component } from "./component";
import { ReactiveScene } from "./reactive-scene";

export class SceneCreator {
  constructor() {
    
  }

  registElement(elementConf) {
    this.elementMetaInfos[elementConf.name] = elementConf;
  }

  registComponent(component: Component) {
    this.componentMetaInfos[component.name] = component;
  }

  elementMetaInfos = {};
  componentMetaInfos = {};

  parseRealData(str) {
    
  }

  createElement(conf, datas) {
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
    return obj;
  }

  createComponent(comName: string, datas) {
    const com = new this.componentMetaInfos[comName]();
    ReactiveScene.isCollectrRenderDenpendency = true;
    const creator = new Watcher({} as ReactiveStore, com.render(datas), (newVal) => {
      com.render(datas)
    });
    ReactiveScene.isCollectrRenderDenpendency = false;

    const obj = com.render();
    Object.keys(datas).forEach(key => {
      const data = datas[key];
      if (typeof data !== 'string') { // plain data
        obj[key] = this.parseRealData(data); // Maybe not use
      } else {
        // create att watcher, when function relys denpendency change, auto update new att to scene obj
        const updator = new Watcher({} as ReactiveStore, data, (newVal) => {
          com.render(datas)
        });
      }
    })
    obj.componentInstance = com;
    return obj;
  }
  
  // create a ReactiveScene Fragment from a Component Or Primitive, called by h
  createScene(tag, datas, parent) {
    let obj;
    if (this.elementMetaInfos[tag] !== undefined) { // render primitive element
      obj = this.createElement(this.elementMetaInfos[tag], datas);
    } else {
      obj = this.createComponent(tag, datas);
    }
    return obj;
  }
}

declare var THREE: any;
const creator = new SceneCreator();
creator.registElement({
  name: 'object3D',
  render: () => {
    return new THREE.Object3D;
  }
})
