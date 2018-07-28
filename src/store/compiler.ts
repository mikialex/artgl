import { ComponentTemplate, ComponentTemplateNode, ComponentInstance, Component } from "./component";
import { ReactiveScene } from "./reactive-scene";
import { Watcher } from "./watcher";

export class Compiler {
  constructor() {

  }

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

  // compile:Component => ComponentMold
  // convert jsx to a template obj
  compileComponent(component) {
    const templatecom = new ComponentTemplate();
    component.template = component.render();
    // TODO

    return templatecom;
  }
  createTemplateNode(tag, data, parent) {
    // TODO
  }

  // use template obj template, create real fragment
  // bind real data
  createComponentInstance(tn: ComponentTemplateNode, objParent, comParent) {
    if (comParent === undefined) {
      comParent = new ComponentInstance(tn);
    }
    if (objParent === undefined) {
      // objParent = new THREE.Object3d(); // TODO
    }

    const template = this.getComponentTemplate(tn);
    let com;
    if (tn.ifExp !== undefined) {
      const watcher = new Watcher(tn.ifExp, (newVal) => {
        if (newVal) {
          com = new ComponentInstance(tn);
          // this.bindReactiveDataToPrimitive(tn, obj);
          if (comParent !== undefined) {
            comParent.add(com);
          }
        } else {
          // obj.unbindReactiveDataToPrimitive();
          if (comParent !== undefined) {
            com.dispose();
            comParent.remove(com);
          }
        }
      })

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
    // return comtem;
    // TODO
  }


  createPrimitive(tn: ComponentTemplateNode, parent) {
    let obj;
    if (tn.ifExp !== undefined) {
      const watcher = new Watcher(tn.ifExp, (newVal) => {
        if (newVal) {
          obj = tn.create();
          this.bindReactiveDataToPrimitive(tn, obj);
          parent.add(obj);
        } else {
          obj.unbindReactiveDataToPrimitive();
          parent.remove(obj);
        }
      });
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
      const watcher = new Watcher(dataExp, (newVal) => {
        obj[dataKey] = newVal;
      });
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