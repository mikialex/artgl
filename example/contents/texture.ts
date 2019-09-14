import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene, SphereGeometry, Mesh,
  PerspectiveCamera, Vector4, OrbitController, Material,
  ChannelType
} from '../../src/artgl';
import { Texture, TextureSource } from '../../src/core/texture';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine(canvas);

  const scene = new Scene();

  const geometry = new SphereGeometry();
  const material = new Material();

  const texture = new Texture(await TextureSource.fromUrl(
    testBridge.getResourceURL("img/demo.jpg")));
  
  material.channel(ChannelType.diffuse, texture)

  const mesh = new Mesh().g(geometry).m(material)

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

  engine.camera.bindEngineRenderSize(engine);
  testBridge.resizeObserver.add((size) => {
    engine.setSize(size.width, size.height);
  })

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
