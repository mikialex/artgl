import {
  SphereGeometry, PlaneGeometry, AmbientLight, Mesh, SceneNode,
  Shading, CubeGeometry, Vector3, DirectionalLight, PhongShading, BarycentricWireFrame,
  ExposureController, ToneMapType 
} from '../../../src/artgl';
import { PointLight } from '../../../src/light/point-light';
import { RenderConfig } from '@/components/conf/interface';
import { Application } from '../application';
import { ArrowGeometry } from '../../../src/geometry/geo-lib/arrow-geometry';
import { createBarycentricBufferForStandardGeometry } from '../../../src/geometry/geo-util/barycentric'
import { DirectionalShadowMap } from '../../../src/shadow-map/directional-shadowmap'

export default function (root: SceneNode, app: Application, shading: Shading) {
  const sphereGeo = new SphereGeometry(1, 40, 40);
  createBarycentricBufferForStandardGeometry(sphereGeo);
  const planeGeo = new PlaneGeometry(10, 10, 10, 10);
  createBarycentricBufferForStandardGeometry(planeGeo);
  const cubeGeo = new CubeGeometry(5, 3, 4)
  createBarycentricBufferForStandardGeometry(cubeGeo);

  app.engine.defaultShading = shading;

  const arrowGeo = new ArrowGeometry()
  createBarycentricBufferForStandardGeometry(arrowGeo);
  const arrow = new Mesh().g(arrowGeo).s(shading)
  root.addChild(arrow);

  const planeMesh = new Mesh().g(planeGeo).s(shading)
  root.addChild(planeMesh);

  const ground = new Mesh().g(planeGeo).s(shading)
  ground.transform.position.y = -2;
  ground.transform.rotation.x = - Math.PI / 4;
  ground.transform.rotation.y = - Math.PI / 4;
  root.addChild(ground);

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

}
