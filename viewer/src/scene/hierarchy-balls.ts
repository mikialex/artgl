import {
  SphereGeometry, PlaneGeometry, AmbientLight, Mesh, SceneNode,
  Shading, CubeGeometry, Vector3, DirectionalLight
} from '../../../src/artgl';
import { PointLight } from '../../../src/light/point-light';
import { ExposureController, ToneMapType } from '../../../src/shading/basic-lib/exposurer';
import { RenderConfig } from '@/components/conf/interface';
import { Application } from '../application';

export default function (root: SceneNode, app: Application): RenderConfig {
  const sphereGeo = new SphereGeometry(1, 40, 40);
  const planeGeo = new PlaneGeometry(10, 10, 10, 10);
  const cubeGeo = new CubeGeometry(5, 3, 4)

  const pointLight = new PointLight();
  pointLight.position = new Vector3(0, 3, 0);
  pointLight.color = new Vector3(0.9, 0.8, 0.5);
  pointLight.radius = 10;

  const ambient = new AmbientLight();
  ambient.color = new Vector3(0.3, 0.3, 0.4);

  const dirLight = new DirectionalLight();
  dirLight.color = new Vector3(0.3, 0.6, 0.4);
  dirLight.direction = new Vector3(1, 1, -1).normalize();

  const exposureController = new ExposureController();

  let shading = new Shading()
    // .decorate(new NormalShading())
    .decorate(pointLight)
    .decorate(ambient)
    .decorate(dirLight)
    .decorate(exposureController)
  
  console.log(exposureController)

  shading.afterShaderCompiled.add((config) => {
    console.log(config);
  })

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

  return {
    name: 'exposureControl',
    value: [
      {
        name: 'exposureMax',
        value: 1 / exposureController.toneMappingExposure,
        onChange: (value: number) => {
          exposureController.toneMappingExposure = 1 / value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 5,
            step: 0.1
          },
        ]
      },
      {
        name: 'exposureWhitePoint',
        value: exposureController.toneMappingWhitePoint,
        onChange: (value: number) => {
          exposureController.toneMappingWhitePoint = value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 5,
            step: 0.1
          },
        ]
      },
      {
        name: 'exposureToneMapType',
        value: exposureController.toneMapType,
        valueConfig: {
          type: "select",
          selectItem: Object.keys(ToneMapType)
        },
        onChange: (value: ToneMapType) => {
          exposureController.toneMapType = value;
          app.pipeline.resetSample();
        },
      }
    ]
  }

}
