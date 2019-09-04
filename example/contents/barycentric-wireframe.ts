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

  let canvas = document.querySelector('canvas')!;
  const engine = new RenderEngine(canvas);

  const scene = new Scene();

  const geometry = new SphereGeometry();
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
  camera.transform.position.set(0, 0, 15);
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

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
