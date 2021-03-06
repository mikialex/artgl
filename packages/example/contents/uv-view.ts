import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene,
  PerspectiveCamera, Vector4, OrbitController, PlaneGeometry, Shading,
  BaseEffectShading, ShaderGraph, texture, ChannelType, UvFragVary, vec4,
  constValue, Line, SphereGeometry, Mesh, Material, Texture, GLDataType,
  CommonAttribute, TextureSource, makeStandardGeometryWireFrame,
  loadObjFile, loadImageFromFile, SceneNode
} from 'artgl';

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
      .setFragmentRoot(constValue(new Vector4(1, 1, 1, 1)))
  }
}


export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });

  const scene = new Scene();

  const uvLineShading = new Shading()
    .decorate(new ShowUV())
    .decoCamera()
  const line = new SceneNode().with(new Line().g(makeStandardGeometryWireFrame(new SphereGeometry())).s(uvLineShading));
  scene.root.addChild(line);

  const quadGeometry = new PlaneGeometry();
  const material = new Material().setChannelColor(ChannelType.diffuse, new Vector3(0.5, 0.5, 0.5));
  const textureShading = new Shading()
    .decorate(new DiffuseShading())
    .decoCamera()
  const quad =  new SceneNode().with(new Mesh().g(quadGeometry).s(textureShading).m(material));
  quad.transform.position.set(0.5,0.5,-0.01)
  scene.root.addChild(quad);

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  const cameraNode = new SceneNode();
  camera.transform = cameraNode.transform;
  camera.transform.position.set(0.5, 0.5, 2);
  camera.transform.lookAt(new Vector3(0.5, 0.5, 0))
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

  testBridge.testConfig = [
    {
      name: 'change geometry',
      onClick: async () => {
        const newGeometry = await loadObjFile();
        makeStandardGeometryWireFrame(newGeometry);
        // line.geometry!.dispose(); // todo
        line.renderEntities[0].g(newGeometry);
      },
    },
    {
      name: 'change texture',
      onClick: async () => {
        const newImg = await loadImageFromFile();
        // material.getChannelTexture(ChannelType.diffuse)!.dispose() // todo
        material.setChannelTexture(
          ChannelType.diffuse, new Texture(TextureSource.fromImageElement(newImg))
        );
      },
    },
  ]
}
