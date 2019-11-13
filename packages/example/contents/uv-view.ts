import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderEngine, Scene,
  PerspectiveCamera, Vector4, OrbitController, PlaneGeometry, Shading,
  BaseEffectShading, ShaderGraph, texture, ChannelType, UvFragVary, vec4,
  constValue, Line, SphereGeometry, Mesh, Material, Texture, 
} from 'artgl';
import { GLDataType } from 'artgl/src/core/data-type';
import { CommonAttribute } from 'artgl/src/webgl/interface';
import { loadObjFile } from 'artgl/src/loader/obj-loader';
import { TextureSource } from 'artgl/src/core/texture-source';
import { loadImageFromFile } from 'artgl/src/util/file-io';
import { makeStandardGeometryWireFrame } from 'artgl/src/geometry/geo-util/wireframe';

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
  const line = new Line().g(makeStandardGeometryWireFrame(new SphereGeometry())).s(uvLineShading);
  scene.root.addChild(line);

  const quadGeometry = new PlaneGeometry();
  const material = new Material().setChannelColor(ChannelType.diffuse, new Vector3(0.5, 0.5, 0.5));
  const textureShading = new Shading()
    .decorate(new DiffuseShading())
    .decoCamera()
  const quad = new Mesh().g(quadGeometry).s(textureShading).m(material);
  quad.transform.position.set(0.5,0.5,-0.01)
  scene.root.addChild(quad);

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  camera.transform.position.set(0.5, 0.5, 2);
  camera.lookAt(new Vector3(0.5, 0.5, 0))
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

  testBridge.testConfig = [
    {
      name: 'change geometry',
      onClick: async () => {
        const newGeometry = await loadObjFile();
        makeStandardGeometryWireFrame(newGeometry);
        // line.geometry!.dispose(); // todo
        line.g(newGeometry);
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
