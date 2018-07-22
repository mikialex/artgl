import { Watcher, createWatcherIfNeed } from "./watcher";
import { ReactiveScene } from "./reactive-scene";

// component is a composeabel fragment of scene descripition
// that map reactive data from props or store to scene tree
//
// component is directly rendered by reactive scene
export class Component{
  constructor() {
    
  }
  store:any = {};
  name: string;
  render(props) {
    
  }

  componentWillMount() {
    
  }

  //...other hooks
}

export class ComponentTemplateNode{
  tag: string;
  isPrimitive: boolean;
  isComponent: boolean;
  create: () => any;
  datas: {
    
  };
  add() {

  }
  remove() {

  }
  ifExp: () => boolean;
}

export class ComponentTemplate {
  constructor() {
    
  }
  template: ComponentTemplateNode;

}

export class ComponentInstance{
  constructor(comtemplate) {
    
  }
  store: any = {};
  parent: Component;
  children: Component[];
  props: any = {};
  updateWatchers: Watcher[];
  createWatchers: Watcher[];
  dispose() {
    
  }
  add() {
    
  }
  remove() {
    
  }
}


export class Compiler {
  constructor() {
    
  }

  // compile:Component => ComponentMold
  // convert jsx to a bone obj
  compileComponent(component) {
    const mold = new ComponentTemplate();

    ReactiveScene.useFakeElement = true;
    component.bone = component.render();
    ReactiveScene.useFakeElement = false;

    return mold;
  }

  // use template obj template, create real fragment
  // bind real data
  createComponentInstance(tn: ComponentTemplateNode, objParent, comParent) {
    if (comParent === undefined) {
      comParent = new ComponentInstance(tn);
    }
    if (objParent === undefined) {
      objParent = new THREE.Object3d();
    }

    const template = this.getComponentTemplate(tn).template;
    let com;
    if (tn.ifExp !== undefined) {
      const watcher = createWatcherIfNeed(tn.ifExp);
      if (watcher !== undefined) {
        watcher.callback = (newVal) => {
          if (newVal) {
            com = new ComponentInstance(tn);
            // this.bindReactiveDataToPrimitive(tn, obj);
            if(comParent !== undefined) {
              comParent.add(com);
            }
          } else {
            // obj.unbindReactiveDataToPrimitive();
            if (comParent !== undefined) {
              com.dispose();
              comParent.remove(com);
            }
          }
        }
      }
    }
    const shouldCreate = tn.ifExp();
    if (!shouldCreate) {
      return;
    } else {
      com = tn.create();
      // this.bindReactiveDataToPrimitive(tn, obj);
    }

    return this.traverseTemplate(template, (tn: ComponentTemplateNode, obj, com) => {
      if (tn.isPrimitive) {
        const newObj = this.createPrimitive(tn, obj);
        return obj;
      } else if (tn.isComponent) {
        const newComInstance = this.createComponentInstance(tn, obj, com);
        const newObj = newComInstance.objInstance;
        obj.add(newObj);
        com.add(newComInstance);
        return newComInstance;
      }
    }, objParent, comParent).com;
  }

  // bindReactiveDataToComponentInstance(tn, com:ComponentInstance) {
  //   Object.keys(tn.datas).forEach(dataKey => {
  //     const dataExp = tn.datas[dataKey];
  //     const watcher = createWatcherIfNeed(dataExp);
  //     if (watcher !== undefined) {
  //       watcher.callback = (newVal) => {
  //         com.props[dataKey] = newVal;
  //       }
  //       com.updateWatchers.push(watcher);
  //     } else { // static
  //       com.props[dataKey] = dataExp();
  //     }
  //   })
  // }
  // unbindReactiveDataToComponentInstance(com: ComponentInstance) {
  //   com.updateWatchers = [];
  // }

  getComponentTemplate(tn: ComponentTemplateNode) {
    return comtem;
  }


  createPrimitive(tn: ComponentTemplateNode, parent) {
    let obj;
    if (tn.ifExp !== undefined) {
      const watcher = createWatcherIfNeed(tn.ifExp);
      if (watcher !== undefined) {
        watcher.callback = (newVal) => {
          if (newVal) {
            obj = tn.create();
            this.bindReactiveDataToPrimitive(tn,obj);
            parent.add(obj);
          } else {
            obj.unbindReactiveDataToPrimitive();
            parent.remove(obj);
          }
        }
      }
    }
    const shouldCreate = tn.ifExp();
    if (!shouldCreate) {
      return;
    } else {
      obj = tn.create();
      this.bindReactiveDataToPrimitive(tn, obj);
    }
  }


  bindReactiveDataToPrimitive(tn, obj) {
    Object.keys(tn.datas).forEach(dataKey => {
      const dataExp = tn.datas[dataKey];
      const watcher = createWatcherIfNeed(dataExp);
      if (watcher !== undefined) {
        watcher.callback = (newVal) => {
          obj[dataKey] = newVal;
        }
        obj.updateWatchers.push(watcher);
      } else { // static
        obj[dataKey] = dataExp();
      }
    })
  }
  unbindReactiveDataToPrimitive(obj) {
    obj.updateWatchers = [];
  }

  traverseTemplate(templateNode, callback, objParent, comParent) {
    const result = callback(callback, objParent, comParent);
    let nextObjParent = objParent;
    let nextComParent = comParent;
    if (result.isOBj) {
      if (objParent === undefined) {
        objParent = result;
      } else {
        objParent.add(result);
        nextObjParent = result;
      }
    } else if (result.isCom) {
      if (comParent === undefined) {
        comParent = result;
      } else {
        comParent.add(result);
        nextComParent = result;
      }
      if (objParent === undefined) { 
        objParent = result;
      } else {
        objParent.add(result);
        nextObjParent = result;
      }
    } else { // not create anything
      
    }

    templateNode.children.forEach(tn => {
      this.traverseTemplate(tn, callback, nextObjParent, nextComParent);
    });

    return {
      obj: objParent,
      com: comParent
    }
  }

}