import { TestBridge } from '../src/test-bridge';
import {
  Vector3, RenderRange, Vector4, RenderEngine, CullSide,
  Scene, SphereGeometry, Mesh, PerspectiveCamera, OrbitController
} from '../../src/artgl';
import { CubeTexture } from '../../src/core/texture-cube';
import { TextureSource } from '../../src/core/texture-source';
import { CubeEnvrionmentMapBackGround } from '../../src/scene/background';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine(canvas);

  const scene = new Scene();

  const mesh = new Mesh();

  const geometry = new SphereGeometry();
  mesh.g(geometry);
  
  mesh.state.cullSide = CullSide.CullFaceNone;

  scene.root.addChild(mesh);

  const skyCube = new CubeTexture();
  skyCube.negativeXMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/nx.jpg"))
  skyCube.positiveXMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/px.jpg"))
  skyCube.negativeYMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/ny.jpg"))
  skyCube.positiveYMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/py.jpg"))
  skyCube.negativeZMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/nz.jpg"))
  skyCube.positiveZMap = await TextureSource.fromUrl(testBridge.getResourceURL("img/skybox/pz.jpg"))
  const cubeEnv = new CubeEnvrionmentMapBackGround(skyCube);
  cubeEnv.texture = skyCube;
  scene.background = cubeEnv;

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  camera.transform.position.set(0, 0, 5);
  camera.lookAt(new Vector3(0, 0, 0))
  engine.useCamera(camera);

  function draw() {
    engine.setClearColor(new Vector4(0.9, 0.9, 0.9, 1.0))
    engine.clearColor();
    // engine.render(scene);
    cubeEnv.render(engine);
  }

  draw();

  //==<

  await testBridge.screenShotCompareElement(canvas, "test");

  const orbitController = new OrbitController(camera as PerspectiveCamera);
  orbitController.registerInteractor(engine.interactor);

  testBridge.resizeObserver.add((size) => {
    engine.setSize(size.width, size.height);
    camera.updateRenderRatio(engine);
  })

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
