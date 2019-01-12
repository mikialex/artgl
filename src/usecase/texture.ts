import ARTGL from '../export';
import { loadImageFromURL } from '../util/file-io';
import { Texture } from '../core/texture';
import { PerspectiveCamera } from '../camera/perspective-camera';

export default async function() {
  let canv = document.querySelector('canvas') as HTMLCanvasElement;
  const engine = new ARTGL.ARTEngine(canv);

  const img = await loadImageFromURL('/static/world.jpg');
  const texture = new Texture();
  texture.image = img;
  let testGeoSphere = new ARTGL.SphereGeometry(1,40,40);
  let testTech = new ARTGL.TestTechnique();
  let testSpere = new ARTGL.Mesh();
  let testMat = new ARTGL.Material();
  testMat.setChannel('texture', texture);
  testSpere.geometry = testGeoSphere;
  testSpere.technique = testTech;
  testSpere.material = testMat;
  
  const myInteractor = new ARTGL.Interactor(canv);
  const myOrbitControler = new ARTGL.OrbitController(engine.camera as PerspectiveCamera);
  myOrbitControler.registerInteractor(myInteractor);

  let active = false;
  document.body.addEventListener('mouseenter', () => {
    active = true;
  })
  document.body.addEventListener('mouseleave', () => {
    active = false;
  })

  function render() {
    myOrbitControler.update();
    engine.renderObject(testSpere);
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