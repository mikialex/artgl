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

export default function (root: SceneNode, app: Application): RenderConfig {
  const sphereGeo = new SphereGeometry(1, 40, 40);
  createBarycentricBufferForStandardGeometry(sphereGeo);
  const planeGeo = new PlaneGeometry(10, 10, 10, 10);
  createBarycentricBufferForStandardGeometry(planeGeo);
  const cubeGeo = new CubeGeometry(5, 3, 4)
  createBarycentricBufferForStandardGeometry(cubeGeo);

  const pointLight = new PointLight();
  pointLight.position = new Vector3(-1, 3, 3);
  pointLight.color = new Vector3(0.9, 0.8, 0.5);
  pointLight.radius = 10;

  const dirLight = new DirectionalLight();
  dirLight.color = new Vector3(0.3, 0.6, 0.8);
  dirLight.direction = new Vector3(1, 1, -1).normalize();

  const ambient = new AmbientLight();
  ambient.color = new Vector3(0.3, 0.3, 0.4);

  const exposureController = new ExposureController();

  const wireframe = new BarycentricWireFrame();

  const phong = new PhongShading<DirectionalLight | PointLight>([dirLight, pointLight]);

  let shading = new Shading()
    .decorate(app.pipeline.dof)
    .decorate(phong)
    .decorate(ambient)
    .decorate(exposureController)
    .decorate(wireframe)

  const defaultShading = new Shading()
    .decorate(app.pipeline.dof)
    .decorate(phong)
    .decorate(ambient)
    .decorate(exposureController)

  app.engine.defaultShading = defaultShading;


  shading.afterShaderCompiled.add((config) => {
    console.log(config);
  })

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

  const exposureConfig = {
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
        show: () => {
          return exposureController.toneMapType === ToneMapType.Uncharted2ToneMapping
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

  const phongConfig = {
    name: "phong",
    value: [
      {
        name: 'shininess',
        value: phong.shininess,
        onChange: (value: number) => {
          phong.shininess = value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 100,
            step: 1
          },
        ]
      }
    ]
  }

  const dofConfig = {
    name: "progressive dof",
    value: [
      {
        name: 'focusLength',
        value: app.pipeline.dof.focusLength,
        onChange: (value: number) => {
          app.pipeline.dof.focusLength = value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 50,
            step: 0.1
          },
        ]
      },
      {
        name: 'coc radius',
        value: app.pipeline.dof.blurRadius,
        onChange: (value: number) => {
          app.pipeline.dof.blurRadius = value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.001
          },
        ]
      }
    ]
  }

  return {
    name: 'scene shading',
    value: [
      exposureConfig,
      phongConfig,
      dofConfig
    ]
  }

}
