import { ARTEngine, PerspectiveCamera, TestTechnique, Mesh, Interactor, OrbitController, Material } from "../../src/artgl";

import { loadObjFile } from "../../src/loader/obj-loader";

let mesh: Mesh;

async function loadObj() {
  const geometry = await loadObjFile();
  const testTech = new TestTechnique();
  mesh = new Mesh();
  mesh.geometry = geometry;
  mesh.technique = testTech;
}

export default function() {
  (window as any).load = loadObj;
  let canv = document.querySelector('canvas') as HTMLCanvasElement; 
  const engine = new ARTEngine(canv);

  const myInteractor = new Interactor(canv);
  const myOrbitControler = new OrbitController(engine.camera as PerspectiveCamera);
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