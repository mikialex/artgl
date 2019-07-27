import * as ARTGL from '../../src/artgl'
import { TestBridge } from './test-bridge';
import { Vector3 } from '../../src/artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = document.querySelector('canvas');
  const engine = new ARTGL.RenderEngine(canvas);

  const scene = new ARTGL.Scene();

  const geometry = new ARTGL.SphereGeometry();

  const mesh = new ARTGL.Mesh();
  const line = new ARTGL.Line();
  const points = new ARTGL.Points();

  mesh.geometry = geometry;
  line.geometry = geometry;
  points.geometry = geometry;

  line.transform.position.x = -5;
  points.transform.position.x = 5;

  scene.root.addChild(mesh);
  scene.root.addChild(line);
  scene.root.addChild(points);

  const camera = engine.camera as ARTGL.PerspectiveCamera;
  camera.transform.position.set(0, 0, 15);
  camera.lookAt(new Vector3(0,0,0))

  function draw() {
    engine.connectCamera();
    engine.renderer.state.colorbuffer.setClearColor(new ARTGL.Vector4(0.9, 0.9, 0.9, 1.0))
    engine.renderer.state.colorbuffer.clear()
    engine.render(scene);
  }

  draw();


  //==<

  // await testBridge.screenShot();
  // await testBridge.testOver();


  const interactor = new ARTGL.Interactor(canvas);
  const orbitController = new ARTGL.OrbitController(camera as ARTGL.PerspectiveCamera);
  orbitController.registerInteractor(interactor);

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
