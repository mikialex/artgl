import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene, SphereGeometry, Mesh,
  PerspectiveCamera, Vector4, OrbitController, Material,
  ChannelType, textureFromUrl, ShaderGraph, texture,
  BaseEffectShading, UvFragVary, Shading
} from '../../src/artgl';

export class CustomShading extends BaseEffectShading<CustomShading> {
  decorate(graph: ShaderGraph): void {
    graph
      .declareFragUV()
      .setFragmentRoot(
        texture(ChannelType.diffuse).fetch(graph.getVary(UvFragVary))
      )
  }

}

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine(canvas);

  const geometry = new SphereGeometry();
  const material = new Material();
  const shading = new Shading().decorate(new CustomShading());

  const texture = await textureFromUrl(
    testBridge.getResourceURL("img/demo.png"))
  
  material.channel(ChannelType.diffuse, texture)

  const mesh = new Mesh().g(geometry).m(material).s(shading)

  const camera = engine.camera as PerspectiveCamera;
  camera.transform.position.set(0, 0, 15);
  camera.lookAt(new Vector3(0, 0, 0))

  function draw() {
    engine.connectCamera();
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    engine.renderObject(mesh);
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
