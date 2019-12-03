import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, SphereGeometry, Mesh,
  PerspectiveCamera, Vector4, OrbitController, Material,
  ChannelType, textureFromUrl, ShaderGraph, texture,
  BaseEffectShading, UvFragVary, Shading, SceneNode
} from 'artgl';

export class CustomShading extends BaseEffectShading<CustomShading> {
  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        texture(ChannelType.diffuse).fetch(graph.getVary(UvFragVary))
      )
  }

}

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });
  
  const geometry = new SphereGeometry();
  const material = new Material();
  const shading = new Shading().decoCamera().decorate(new CustomShading());

  const texture = await textureFromUrl(testBridge.getResourceURL("img/demo.jpg"))
  
  material.channel(ChannelType.diffuse, texture)

  const ball = new Mesh().g(geometry).m(material).s(shading)

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  const cameraNode = new SceneNode();
  camera.transform = cameraNode.transform;
  camera.transform.position.set(0, 0, 15);
  camera.transform.lookAt(new Vector3(0, 0, 0))
  engine.useCamera(camera);

  function draw() {
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    engine.renderObject(ball);
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
