import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, SphereGeometry, Mesh,
  PerspectiveCamera, Vector4, OrbitController, Shading, PointLight,
  DirectionalLight, AmbientLight, BarycentricWireFrame, PhongShading,
  ExposureController, createBarycentricBufferForStandardGeometry, Size, SceneNode
} from 'artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });

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
    .decoCamera()
    .decorate(phong)
    .decorate(ambient)
    .decorate(exposureController)
    .decorate(wireframe)

  const mesh = new Mesh().g(geometry).s(shading);


  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  const node = new SceneNode();
  camera.transform = node.transform;
  camera.transform.position.set(2, 2, 2);
  camera.transform.lookAt(new Vector3(0, 0, 0));
  engine.useCamera(camera);

  function draw() {
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    engine.renderObject(mesh);
  }

  draw();


  //==<

  await testBridge.screenShotCompare("test");

  const orbitController = new OrbitController(node);
  orbitController.registerInteractor(engine.interactor);

  testBridge.resizeObserver.add((size: Size) => {
    engine.setSize(size.width, size.height);
    camera.updateRenderRatio(engine)
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
