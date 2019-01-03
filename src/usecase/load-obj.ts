import { GLRenderer, ARTEngine, PerspectiveCamera, TestTechnique, Mesh, Interactor, OrbitController, SphereGeometry, Material } from "../artgl";

import { loadObjFile } from "../loader/obj-loader";

let mesh: Mesh;

async function loadObj() {
  const geometry = await loadObjFile();
  const testTech = new TestTechnique();
  const material = new Material();
  mesh = new Mesh();
  mesh.geometry = geometry;
  mesh.technique = testTech;
}

export default function() {
  (window as any).load = loadObj;
  let canv = document.querySelector('canvas') as HTMLCanvasElement; 
  const width = canv.clientWidth;
  const height = canv.clientHeight;
  const engine = new ARTEngine(canv);
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

  function render() {
    myOrbitControler.update();
    camera.updateWorldMatrix(true);
    engine.updateViewProjection(camera);
    if (mesh !== undefined) {
      engine.renderObject(mesh);
    }
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