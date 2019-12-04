import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene, SphereGeometry, Mesh,
  Line, Points, PerspectiveCamera, Vector4, OrbitController, SceneNode,
} from 'artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });

  const scene = new Scene();

  const geometry = new SphereGeometry();

  const mesh = new SceneNode().with(new Mesh().g(geometry));
  const line = new SceneNode().with(new Line().g(geometry));
  const points = new SceneNode().with(new Points().g(geometry));

  line.transform.position.x = -5;
  points.transform.position.x = 5;

  scene.root.addChild(mesh);
  scene.root.addChild(line);
  scene.root.addChild(points);

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  const cameraNode = new SceneNode();
  camera.transform = cameraNode.transform;
  camera.transform.position.set(0, 0, 15);
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
    camera.updateRenderRatio(engine)
  })

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
