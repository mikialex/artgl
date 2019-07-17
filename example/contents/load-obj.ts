import {
  ARTEngine, PerspectiveCamera, Mesh, Interactor,
  OrbitController, Technique, NormalShading
} from "../../src/artgl";

import { loadObjFile } from "../../src/loader/obj-loader";

let mesh: Mesh;

async function loadObj() {
  const geometry = await loadObjFile();
  const testTech = new Technique(new NormalShading());
  mesh = new Mesh();
  mesh.geometry = geometry;
  mesh.technique = testTech;
}

export default function() {
  (window as any).load = loadObj;
  let canvas = document.querySelector('canvas') as HTMLCanvasElement; 
  const engine = new ARTEngine(canvas);

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