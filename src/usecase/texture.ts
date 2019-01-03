import ARTGL from '../export';
import { loadImageFromURL } from '../util/file-io';
import { Texture } from '../core/texture';

export default async function() {
  let canv = document.querySelector('canvas') as HTMLCanvasElement; 
  const width = canv.clientWidth;
  const height = canv.clientHeight;
  const engine = new ARTGL.ARTEngine(canv);
  const camera = new ARTGL.PerspectiveCamera();

  camera.aspect = width / height;
  camera.position.set(0, 0, 10);
  camera.updateLocalMatrix();
  camera.updateWorldMatrix(true);
  engine.updateViewProjection(camera);

  const img = await loadImageFromURL('/static/world.jpg');
  const texture = new Texture();
  texture.image = img;
  // let testGeo = new ARTGL.TestGeometry();
  let testGeoSphere = new ARTGL.SphereGeometry(1,40,40);
  let testTech = new ARTGL.TestTechnique();
  let testSpere = new ARTGL.Mesh();
  let testMat = new ARTGL.Material();
  testMat.setChannel('texture', texture);
  testSpere.geometry = testGeoSphere;
  testSpere.technique = testTech;
  testSpere.material = testMat;
  
  const myInteractor = new ARTGL.Interactor(canv);
  const myOrbitControler = new ARTGL.OrbitController(camera);
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
    camera.updateWorldMatrix(true);
    engine.updateViewProjection(camera);
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