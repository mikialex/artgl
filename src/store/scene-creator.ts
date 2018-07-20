import { Watcher, createWatcherIfNeed } from "./watcher";
import { ReactiveStore } from "./reactive-store";
import { Component } from "./component";
import { ReactiveScene } from "./reactive-scene";

// scene creator reponsible for sceneFragment binding with data
export class SceneCreator {

  // this holds info that registed by outside
  // these info discribe how to create component and primitive
  elementMetaInfos = {};
  componentMetaInfos = {};
  registPrimitive(elementConf) {
    this.elementMetaInfos[elementConf.name] = elementConf;
  }
  registComponent(component: Component) {
    this.componentMetaInfos[component.name] = component;
  }


  parseRealData(str) { // TODO
    
  }

  // create a scene object that its att is binding to store
  createPrimitive(conf, datas, parent) {
    const obj = conf.render();
    parent.add(obj);
    Object.keys(datas).forEach(key => {
      const dataExp = () => { return datas[key] };
      const watcher = createWatcherIfNeed(dataExp);
      if (watcher !== null) { // indeed rely reactive data
        watcher.callback = (newVal) => {
          obj[key] = newVal;
        }
      } else {
        obj[key] = datas[key];
      }
    })
    return obj;
  }
  
  //
  createComponent(comName: string, datas, parent) {
    const com = new this.componentMetaInfos[comName]();

    // collect render function it selfs denpendency
    ReactiveScene.isCollectingRenderDenpendency = true;
    const creator = new Watcher(() => { com.render(datas) }, null);
    ReactiveScene.isCollectingRenderDenpendency = false;

    const obj = com.render();
    parent.add(obj);
    obj.componentInstance = com;
    com.objectInstance = obj;

    if (creator.isARealWatcher) { // indeed rely reactive data
      com.watcher.push(creator);
      creator.callback = (newVal) => {
        // TODO rerender component, teardown all old watcher.
        // TODO great performence issuse, any dep data change will cause full rerender
        const newObj = com.render(datas)
        parent.remove(obj);
        parent.add(newObj);
      }
    } else {
      // creator will be gc
      return com;
    }
    return com;
  }
  
  // create a ReactiveScene Fragment from a Component Or Primitive, called by h
  createScene(tag, datas, parent) {
    let obj;
    if (this.elementMetaInfos[tag] !== undefined) { // render primitive element
      obj = this.createPrimitive(this.elementMetaInfos[tag], datas, parent);
    } else {
      obj = this.createComponent(tag, datas, parent).obj;
    }
    return obj;
  }
}

// reqiste THREE primitives
declare var THREE: any;
const creator = ReactiveScene.SceneCreator;
creator.registPrimitive({
  name: 'object3D',
  render: () => {
    return new THREE.Object3D;
  }
})
