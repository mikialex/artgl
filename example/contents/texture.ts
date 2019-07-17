import { loadImageFromURL } from '../../src/util/file-io';
import {
  ARTEngine, SphereGeometry, Technique, Mesh, Material,
  ChannelType, Interactor, OrbitController, PerspectiveCamera,
  NormalShading
} from '../../src/artgl';
import { Texture } from '../../src/core/texture';

export default async function() {
  let canvas = document.querySelector('canvas') as HTMLCanvasElement;
  const engine = new ARTEngine(canvas);

  const img = await loadImageFromURL('/static/world.jpg');
  const texture = new Texture();
  texture.image = img;
  let testGeoSphere = new SphereGeometry(1,40,40);
  let testTech = new Technique(new NormalShading());
  let testSphere = new Mesh();
  let testMat = new Material();
  testMat.setChannelTexture(ChannelType.diffuse, texture);
  testSphere.geometry = testGeoSphere;
  testSphere.technique = testTech;
  testSphere.material = testMat;
  
  const myInteractor = new Interactor(canvas);
  const myOrbitController = new OrbitController(engine.camera as PerspectiveCamera);
  myOrbitController.registerInteractor(myInteractor);

  let active = false;
  document.body.addEventListener('mouseenter', () => {
    active = true;
  })
  document.body.addEventListener('mouseleave', () => {
    active = false;
  })

  function render() {
    myOrbitController.update();
    engine.renderObject(testSphere);
  }

  window.requestAnimationFrame(tick);
  let time = 0;
  render();
  function tick() {
    time++;
    if (active) {
      render();
    }
    window.requestAnimationFrame(tick);
  }
}