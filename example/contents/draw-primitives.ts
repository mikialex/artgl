import { TestBridge } from './test-bridge';
import {
  Vector3, RenderEngine, Scene, SphereGeometry, Mesh,
  Line, Points, PerspectiveCamera, Vector4, OrbitController
} from '../../src/artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = document.querySelector('canvas')!;
  const engine = new RenderEngine(canvas);

  const scene = new Scene();

  const geometry = new SphereGeometry();

  const mesh = new Mesh();
  const line = new Line();
  const points = new Points();

  mesh.geometry = geometry;
  line.geometry = geometry;
  points.geometry = geometry;

  line.transform.position.x = -5;
  points.transform.position.x = 5;

  scene.root.addChild(mesh);
  scene.root.addChild(line);
  scene.root.addChild(points);

  const camera = engine.camera as PerspectiveCamera;
  camera.transform.position.set(0, 0, 15);
  camera.lookAt(new Vector3(0,0,0))

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
