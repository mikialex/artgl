import ARTGL from '../export';

export default function() {
  let canv = document.querySelector('canvas') as HTMLCanvasElement; 
  const width = canv.clientWidth;
  const height = canv.clientHeight;
  let renderer = new ARTGL.GLRenderer(canv);
  renderer.setSize(width, height);
  const engine = new ARTGL.ARTEngine(renderer);
  const camera = new ARTGL.PerspectiveCamera();

  camera.aspect = width / height;
  camera.position.set(0, 0, 10);
  camera.updateLocalMatrix();
  camera.updateWorldMatrix(true);
  engine.updateViewProjection(camera);


  // let testGeo = new ARTGL.TestGeometry();
  let testGeoSphere = new ARTGL.SphereGeometry(1,40,40);
  let testMat = new ARTGL.TestTechnique();
  let testSpere = new ARTGL.Mesh(testGeoSphere, testMat)

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