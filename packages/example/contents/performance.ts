import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene, Mesh,
  PerspectiveCamera, Vector4, OrbitController, SceneNode, CubeGeometry,
} from 'artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });
  engine.renderer.enableUniformDiff = false;

  const scene = new Scene();

  const geometry = new CubeGeometry();

  const mesh = new Mesh().g(geometry);

  const arraySize = 20;
  console.log(arraySize * arraySize * arraySize);
  const grid = 1;
  for (let i = 0; i < arraySize; i++) {
    const node = new SceneNode();
    node.transform.position.x = i * grid;
    scene.root.addChild(node);
    for (let j = 0; j < arraySize; j++) {
      const node2 = new SceneNode();
      node2.transform.position.y = j * grid;
      node.addChild(node2);
      for (let k = 0; k < arraySize; k++) {

        const testMesh = new SceneNode().with(mesh);
        testMesh.transform.position.z = k * grid;
        testMesh.transform.scale.setAll(0.3);
        node2.addChild(testMesh);
      }
    }
  }

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
