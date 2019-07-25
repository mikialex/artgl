import {
  SphereGeometry, PlaneGeometry,
  NormalShading, Mesh, SceneNode, Shading
} from '../../../src/artgl';
import { PointLight } from '../../../src/core/light';

export default function (root:SceneNode) {
  let testGeo = new SphereGeometry(1, 40, 40);
  let testPlane = new PlaneGeometry(10, 10, 10, 10);
  const light = new PointLight();
  
  let shading = new Shading()
    .decorate(new NormalShading())
    .decorate(light);

  shading.afterShaderCompiled.add((config) => {
    console.log(config);
  })

  const planeMesh = new Mesh();
  planeMesh.geometry = testPlane;
  planeMesh.shading = shading;
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
        const testMesh = new Mesh();
        testMesh.geometry = testGeo;
        
        // this mesh receive that light
        testMesh.shading = shading;

        testMesh.transform.position.z = k;
        testMesh.transform.scale.set(0.3, 0.3, 0.3);
        node2.addChild(testMesh);
      }
    }
  }
  return root;
}
