import { GLRenderer } from "./renderer/webgl-renderer";
import { GLProgram } from "./webgl/program";
import { TestGeometry } from "./geometry/test-geometery";
import { ARTEngine } from "./renderer/render-engine";
import { Mesh } from "./object/mesh";
import { TestMaterial } from "./material/test-material";
import { Matrix4, Quaternion, Vector3 } from "./math";
import { PerspectiveCamera } from "./camera/perspective-camera";
import { Interactor } from "./interact/interactor";
import { OrbitController } from "./interact/orbit-controler";
import { SphereGeometry } from "./geometry/geo-lib/sphere-geometry";

window.onload = function () {

  let canv = document.querySelector('canvas');
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


  let testGeo = new TestGeometry();
  let testGeoSphere = new SphereGeometry(1,20,20);
  let testMat = new TestMaterial();

  let meshes = [];
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      for (let k = 0; k < 20; k++) {
      // let testGeo2 = new TestGeometry();
      // const testMesh = new Mesh(testGeo2, testMat);

      const testMesh = new Mesh(testGeo, testMat);
      testMesh.position.set(i, j, k);
      testMesh.scale.set(0.1, 0.1, 0.1);
      testMesh.updateLocalMatrix();
      testMesh.updateWorldMatrix(true);
      meshes.push(testMesh);
      }
    }
  }


  let testSpere = new Mesh(testGeoSphere, testMat);



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
    meshes.forEach(mesh => {
      engine.renderObject(mesh);
    })
    // engine.renderObject(testSpere);
  }

  window.requestAnimationFrame(tick);
  let time = 0;
  render();
  function tick() {
    time++;
    // const rotation = (new Quaternion()).setFromAxisAngle(new Vector3(1,1,1).normalize(), time/30);
    // testMesh.matrix.makeRotationFromQuaternion(rotation);
    // testMesh.updateWorldMatrix(true);
    if (active) {
      render();
    }
    window.requestAnimationFrame(tick);
  }

}
