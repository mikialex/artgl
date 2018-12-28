import { GLRenderer, ARTEngine, PerspectiveCamera, TestTechnique, Mesh, Interactor, OrbitController, SphereGeometry, Material } from "../artgl";

import { loadObjFile } from "../loader/obj-loader";

let mesh;

async function loadObj() {
  const geometry = await loadObjFile();
  const testTech = new TestTechnique();
  const material = new Material();
  mesh = new Mesh(geometry, material, testTech);
}

export default function() {
  (window as any).load = loadObj;
  let canv = document.querySelector('canvas') as HTMLCanvasElement; 
  const width = canv.clientWidth;
  const height = canv.clientHeight;
  let renderer = new GLRenderer(canv);
  renderer.setSize(width, height);
  const engine = new ARTEngine(renderer);
  const camera = new PerspectiveCamera();

  camera.aspect = width / height;
  camera.position.set(0, 0, 10);
  camera.updateLocalMatrix();
  camera.updateWorldMatrix(true);
  engine.updateViewProjection(camera);

  const myInteractor = new Interactor(canv);
  const myOrbitControler = new OrbitController(camera);
  myOrbitControler.registerInteractor(myInteractor);

  let active = false;
  document.body.addEventListener('mouseenter', () => {
    active = true;
  })
  document.body.addEventListener('mouseleave', () => {
    active = false;
  })


  let testGeoSphere = new SphereGeometry(1,20,20);
  let testTech = new TestTechnique();
  let testSphere = new Mesh(testGeoSphere, testTech);

  function render() {
    myOrbitControler.update();
    camera.updateWorldMatrix(true);
    engine.updateViewProjection(camera);
    if (mesh !== undefined) {
      engine.renderObject(mesh);
    }
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