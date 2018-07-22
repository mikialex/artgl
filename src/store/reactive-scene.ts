import { ReactiveStoreConfig } from "./reactive-store";
import { Component } from "./component";
import { Compiler } from "./compiler";

interface ReactiveSceneConf{
  store: ReactiveStoreConfig;
}

export class ReactiveScene{
  static compiler = new Compiler();
  static registComponent(com) {
    ReactiveScene.compiler.registComponent(com);
  }

  constructor(conf: ReactiveSceneConf) {
    
  }

  renderRoot(com) {
    
  }

  scene


  // JSX is a very dynamic 
  // we can't/very hard to get relations between a render function 's result
  // and reactive data, so, too optimize rerender watcher, we should not
  // support full JSX, if you try support full. you can't create useful watcher
  // that only update what you should only update scene nodes.
  //
  // vuejs2 support JSX, because vuejs2 use vdom. as we don't want vdom, so 
  // we should back to directive api what vuejs1 proposed. 
  // we use JSX only as a kind of template, support some directives will be enough.
  static h(tag, data, ...rest) { // make JSX as a template 
    ReactiveScene.compiler.createTemplateNode(tag, data, parent);
    rest.forEach(child => {
      child();
    })
  }

}

