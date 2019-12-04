import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderRange, Vector4, RenderEngine, CullSide,
  Scene, SphereGeometry, Mesh, PerspectiveCamera, OrbitController, SceneNode
} from 'artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });

  const scene = new Scene();
  const geometry = new SphereGeometry();

  const mesh = new Mesh().g(geometry);
  const node = new SceneNode().with(mesh);

  const range = RenderRange.fromStandardGeometry(geometry);
  mesh.range = range;
  mesh.state.cullSide = CullSide.CullFaceNone;

  scene.root.addChild(node);

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  const cameraNode = new SceneNode();
  camera.transform = cameraNode.transform;
  camera.transform.position.set(0, 0, 5);
  camera.transform.lookAt(new Vector3(0, 0, 0))
  engine.useCamera(camera);

  function draw() {
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    engine.render(scene);
  }

  draw();

  //==<

  await testBridge.screenShotCompare("test");

  const orbitController = new OrbitController(cameraNode);
  orbitController.registerInteractor(engine.interactor);

  testBridge.resizeObserver.add((size) => {
    engine.setSize(size.width, size.height);
    camera.updateRenderRatio(engine);
  })

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
