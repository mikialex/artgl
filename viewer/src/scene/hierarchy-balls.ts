import {
  SphereGeometry, PlaneGeometry,
  NormalShading, Mesh, SceneNode, Shading, CubeGeometry
} from '../../../src/artgl';
import { PointLight } from '../../../src/core/light';

export default function (root: SceneNode) {
  const sphereGeo = new SphereGeometry(1, 40, 40);
  const planeGeo = new PlaneGeometry(10, 10, 10, 10);
  const cubeGeo = new CubeGeometry(5, 3, 4)
  const light = new PointLight();

  let shading = new Shading()
    .decorate(new NormalShading())
    .decorate(light);

  shading.afterShaderCompiled.add((config) => {
    console.log(config);
  })

  const planeMesh = new Mesh().g(planeGeo).s(shading)
  root.addChild(planeMesh);


  const boxMesh = new Mesh().g(cubeGeo).s(shading)
  boxMesh.transform.position.y = -2;
  root.addChild(boxMesh);

  const arraySize = 5;
  const grid = 1;
  for (let i = 0; i < arraySize; i++) {
    const node = new SceneNode();
    node.transform.position.x = i * grid;
    root.addChild(node);
    for (let j = 0; j < arraySize; j++) {
      const node2 = new SceneNode();
      node2.transform.position.y = j * grid;
      node.addChild(node2);
      for (let k = 0; k < arraySize; k++) {

        const testMesh = new Mesh().g(sphereGeo).s(shading)
        testMesh.transform.position.z = k * grid;
        testMesh.transform.scale.setAll(0.3);
        // testMesh.transform.scale.set(0.3 + i * 0.1, 0.3 + j * 0.1, 0.3 + k * 0.1);
        node2.addChild(testMesh);
      }
    }
  }
  return root;
}
