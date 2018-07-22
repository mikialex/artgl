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

// component will be compile to static InfoObject
// 
export class ComponentTemplate {
  constructor() {

  }
  template: ComponentTemplateNode;

}
// template node in component tempalte
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


// from component template, compile create actual componentinstance
// componentinstance is a rendered component tree
// from component tree, we can access any subcomponent tree and
// any object tree 
// this is where the scene tree store, mananged by component instance

// TODO
// support local reactive store, to support component props interface
// and component local state center
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

