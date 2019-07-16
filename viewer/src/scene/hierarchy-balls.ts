import { SceneNode } from '../../../src/scene/scene-node';
import ARTGL from '../../../src/export';
import { Technique } from '../../../src/artgl';

export default function (root:SceneNode) {
  let testGeo = new ARTGL.SphereGeometry(1, 40, 40);
  let testPlane = new ARTGL.PlaneGeometry(10, 10, 10, 10);
  let normal = new ARTGL.NormalShading();
  const planeMesh = new ARTGL.Mesh();
  planeMesh.geometry = testPlane;
  planeMesh.technique = new Technique(normal);
  root.addChild(planeMesh);
  for (let i = 0; i < 5; i++) {
    const node = new SceneNode();
    node.transform.position.x = i;
    root.addChild(node);
    for (let j = 0; j < 5; j++) {
      const node2 = new SceneNode();
      node2.transform.position.y = j;
      node.addChild(node2);
      for (let k = 0; k < 5; k++) {
        const testMesh = new ARTGL.Mesh();
        testMesh.geometry = testGeo;
        testMesh.technique = new Technique(normal);
        testMesh.transform.position.z = k;
        testMesh.transform.scale.set(0.3, 0.3, 0.3);
        node2.addChild(testMesh);
      }
    }
  }
  return root;
}
