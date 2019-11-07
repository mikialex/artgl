import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene, Mesh,
  PerspectiveCamera, Vector4, OrbitController, PlaneGeometry, Shading,
  BaseEffectShading, ShaderGraph, texture, ChannelType, UvFragVary, vec4, constValue, Camera, Line
} from '../../src/artgl';
import { GLDataType } from '../../src/core/data-type';
import { CommonAttribute } from '../../src/webgl/interface';

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
      .setVertexRoot(vec4(
        graph.getOrMakeAttribute(CommonAttribute.uv, GLDataType.floatVec2),
        constValue(0), constValue(1)
      ))
  }
}


export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });

  const scene = new Scene();
  const geometry = new PlaneGeometry();

  const shading = new Shading()
    .decorate(new ShowUV())
    .decoCamera()

  const mesh = new Line().g(geometry).s(shading);

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
