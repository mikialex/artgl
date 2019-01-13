import { Vector3 } from '../../../src/math';
import { SceneNode } from '../../../src/scene/scene-node';
import { Scene } from '../../../src/scene/scene';

 
export class SceneView{
  root: SceneNodeView
  static create(scene: Scene) {
    const view = new SceneView();
    view.root = SceneNodeView.create(scene.root);
  }
}

export class SceneNodeView{
  position = new Vector3();
  
  children: SceneNodeView[]
  static create(node: SceneNode) {
    const nodeview = new SceneNodeView();
    nodeview.position.copy(node.transform.position);
    return nodeview;
  }
}