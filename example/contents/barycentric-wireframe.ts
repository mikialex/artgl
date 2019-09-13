import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene, SphereGeometry, Mesh,
  PerspectiveCamera, Vector4, OrbitController, Shading, PointLight,
  DirectionalLight, AmbientLight, BarycentricWireFrame, PhongShading,
  ExposureController
} from '../../src/artgl';
import { createBarycentricBufferForStandardGeometry } from '../../src/geometry/geo-util/barycentric'

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine(canvas);
  const scene = new Scene();

  const geometry = new SphereGeometry(1, 30, 30);
  createBarycentricBufferForStandardGeometry(geometry);

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
    .decorate(phong)
    .decorate(ambient)
    .decorate(exposureController)
    .decorate(wireframe)

  const mesh = new Mesh().g(geometry).s(shading);

  scene.root.addChild(mesh);

  const camera = engine.camera as PerspectiveCamera;
  camera.transform.position.set(2, 2, 2);
  camera.lookAt(new Vector3(0, 0, 0))

  function draw() {
    engine.connectCamera();
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    engine.render(scene);
  }

  draw();


  //==<

  await testBridge.screenShotCompareElement(canvas, "test");

  const orbitController = new OrbitController(camera as PerspectiveCamera);
  orbitController.registerInteractor(engine.interactor);

  engine.camera.bindEngineRenderSize(engine);
  testBridge.resizeObserver.add((size) => {
    engine.setSize(size.width, size.height);
  })

  testBridge.testConfig = [
    {
      name: 'line-width-ratio',
      value: wireframe.barycentricLine_threshold,
      onChange: (value: number) => {
        wireframe.barycentricLine_threshold = value;
      },
      editors: [
        {
          type: 'slider',
          min: 0,
          max: 0.33,
          step: 0.01,
        },
      ]
    },
    {
      name: 'screen-space-ratio',
      value: wireframe.screenSpaceRatio,
      onChange: (value: number) => {
        wireframe.screenSpaceRatio = value;
      },
      editors: [
        {
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.1,
        },
      ]
    },
    {
      name: 'is-screen-spaced',
      value: wireframe.useScreenSpace,
      onChange: (value: boolean) => {
        wireframe.useScreenSpace = value;
      },
    },
  ]

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
