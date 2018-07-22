import { ReactiveStoreConfig } from "./reactive-store";
import { SceneCreator } from "./scene-creator";
import { Component } from "./component";

interface ReactiveSceneConf{
  store: ReactiveStoreConfig;
}

export class ReactiveScene{
  static SceneCreator = new SceneCreator();
  static registComponent(com) {
    ReactiveScene.SceneCreator.registComponent(com);
  }

  constructor(conf: ReactiveSceneConf) {
    
  }

  renderRoot(com) {
    
  }

  scene

  static useFakeElement;
  static isCollectingRenderDenpendency
  static componentTarget
  static h(tag, data, ...rest) { // render ReactiveSceneFragment Recursively
    if (this.useFakeElement) {
      ReactiveScene.SceneCreator.createScene('fake', data, parent);
      rest.forEach(child => {
        child();
      })
    }
    
    if (ReactiveScene.isCollectingRenderDenpendency) {
      Object.keys(data).forEach(key => { // touch props
        return data[key];// touch all possible values, emit getters
      })
      rest.forEach(child => {
        child();
      })
      return;
    }
    ReactiveScene.SceneCreator.createScene(tag, data, parent);
    rest.forEach(child => {
      child();
    })
  }

}

