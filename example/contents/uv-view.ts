import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene, Mesh,
  PerspectiveCamera, Vector4, OrbitController, PlaneGeometry, Shading,
  BaseEffectShading, ShaderGraph, texture, ChannelType, UvFragVary, vec4
} from '../../src/artgl';

class DiffuseShading extends BaseEffectShading<DiffuseShading> {
  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        texture(ChannelType.diffuse).fetch(graph.getVary(UvFragVary))
      )
  }
}

class ShowUV extends BaseEffectShading<ShowUV> {
  decorate(graph: ShaderGraph): void {
    graph
      .setVertexRoot(
        vec4()
      )
      .setFragmentRoot(
        texture(ChannelType.diffuse).fetch(graph.getVary(UvFragVary))
      )
  }
}


export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });

  const scene = new Scene();
  const geometry = new PlaneGeometry();
  const mesh = new Mesh().g(geometry);


  scene.root.addChild(mesh);

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  camera.transform.position.set(0, 0, 15);
  camera.lookAt(new Vector3(0, 0, 0))
  engine.useCamera(camera);

  function draw() {
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    engine.render(scene);
  }

  draw();


  //==<

  await testBridge.screenShotCompareElement(canvas, "test");

  const orbitController = new OrbitController(camera as PerspectiveCamera);
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
