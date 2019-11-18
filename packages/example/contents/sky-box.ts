import { TestBridge } from '../src/test-bridge';
import {
  Vector3, Vector4, RenderEngine, Scene, Mesh, PerspectiveCamera, OrbitController,
  Shading, IBLEnvMap, TorusKnotGeometry, CubeTexture, TextureSource, CubeEnvrionmentMapBackGround
} from 'artgl';

export default async function test(testBridge: TestBridge) {

  //==>

  let canvas = testBridge.requestCanvas();
  const engine = new RenderEngine({ el: canvas });

  const skyCubeMap = new CubeTexture();
  const skyName = 'storm'
  skyCubeMap.negativeXMap = await TextureSource.fromUrl(testBridge.getResourceURL(`img/skybox/${skyName}/nx.jpg`))
  skyCubeMap.positiveXMap = await TextureSource.fromUrl(testBridge.getResourceURL(`img/skybox/${skyName}/px.jpg`))
  skyCubeMap.negativeYMap = await TextureSource.fromUrl(testBridge.getResourceURL(`img/skybox/${skyName}/ny.jpg`))
  skyCubeMap.positiveYMap = await TextureSource.fromUrl(testBridge.getResourceURL(`img/skybox/${skyName}/py.jpg`))
  skyCubeMap.negativeZMap = await TextureSource.fromUrl(testBridge.getResourceURL(`img/skybox/${skyName}/nz.jpg`))
  skyCubeMap.positiveZMap = await TextureSource.fromUrl(testBridge.getResourceURL(`img/skybox/${skyName}/pz.jpg`))
  const cubeEnv = new CubeEnvrionmentMapBackGround(skyCubeMap);
  cubeEnv.texture = skyCubeMap;

  const camera = new PerspectiveCamera().updateRenderRatio(engine)
  camera.transform.position.set(0, 0, 5);
  camera.lookAt(new Vector3(0, 0, 0))
  engine.useCamera(camera);

  const scene = new Scene();

  const geometry = new TorusKnotGeometry(1, 0.4, 256, 32);
  const ibl = new IBLEnvMap()
  ibl.envMap = skyCubeMap;

  let shading = new Shading()
    .decoCamera()
    .decorate(ibl)

  const mesh = new Mesh().g(geometry).s(shading);
  scene.root.addChild(mesh);
  scene.background = cubeEnv;

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
    camera.updateRenderRatio(engine);
  })

  testBridge.framer.setFrame(() => {
    orbitController.update();
    draw();
  })
}
