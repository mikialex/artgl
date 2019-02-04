import { Vector3 } from '../../../src/math';
import { SceneNode } from '../../../src/scene/scene-node';
import { Scene } from '../../../src/scene/scene';
import { Mesh } from '../../../src/artgl';

 
export class SceneView{
  root: SceneNodeView
  static create(scene: Scene): SceneView {
    const view = new SceneView();
    view.root = scene.root.map((node: SceneNode) => {
      return SceneNodeView.create(node);
    })
    return view;
  }

  deleteNode(id: string, scene: Scene) {
    const result = scene.root.findSubNode(id);
    if (result === undefined) {
      return;
    }
    if (result.parent) {
      result.parent.removeChild(result);
    } else { // scene root
      scene.setRootNode(new SceneNode())
    }
  }
}

export class SceneNodeView{
  position = new Vector3();
  uuid: string;
  type = 'node';
  
  children: SceneNodeView[] = [];
  static create(node: SceneNode): SceneNodeView{
    const nodeview = new SceneNodeView();
    nodeview.position.copy(node.transform.position);
    nodeview.uuid = node.uuid;
    if (node instanceof Mesh) {
      nodeview.type = 'mesh'
    }
    return nodeview;
  }

}