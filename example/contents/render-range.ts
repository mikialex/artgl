import { TestBridge } from './test-bridge';
import {
  Vector3, RenderRange, Vector4, RenderEngine, CullSide,
  Scene, SphereGeometry, Mesh, PerspectiveCamera, OrbitController
} from '../../src/artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = document.querySelector('canvas');
  const engine = new RenderEngine(canvas);

  const scene = new Scene();

  const mesh = new Mesh();

  const geometry = new SphereGeometry();
  mesh.geometry = geometry;

  const range = RenderRange.fromStandardGeometry(geometry);
  mesh.range = range;
  mesh.state.cullSide = CullSide.CullFaceNone;

  scene.root.addChild(mesh);

  const camera = engine.camera as PerspectiveCamera;
  camera.transform.position.set(0, 0, 5);
  camera.lookAt(new Vector3(0, 0, 0))

  function draw() {
    engine.connectCamera();
    engine.renderer.state.colorbuffer.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.renderer.state.colorbuffer.clear()
    engine.render(scene);
  }

  draw();

  //==<

  await testBridge.screenShotCompareElement(canvas, "test");

  const orbitController = new OrbitController(camera as PerspectiveCamera);
  orbitController.registerInteractor(engine.interactor);

  let allCount = range.count

  testBridge.testConfig = {
    name: 'width',
    value: range.count,
    onChange: (value: number) => {
      range.count = value;
    },
    editors: [
      {
        type: 'slider',
        min: 0,
        max: allCount,
        step: 1
      },
    ]
  }

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
