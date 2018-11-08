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

window.onload = function () {

  let canv = document.querySelector('canvas');
  const width = canv.clientWidth;
  const height = canv.clientHeight;
  let renderer = new GLRenderer(canv);
  const engine = new ARTEngine(renderer);
  const camera = new PerspectiveCamera();

  camera.aspect = width / height;
  // camera.worldMatrix.setPostion(0, 0, 10);
  camera.position.set(0, 0, 10);
  camera.updateLocalMatrix();
  camera.updateWorldMatrix();
  engine.updateViewProjection(camera);


  let testGeo = new TestGeometry();
  let testMat = new TestMaterial();

  let testMesh = new Mesh(testGeo, testMat);


  const myInteractor = new Interactor(canv);
  const myOrbitControler = new OrbitController(camera, myInteractor);

  window.requestAnimationFrame(tick);
  let time = 0;
  function tick() {
    time++;
    const rotation = (new Quaternion()).setFromAxisAngle(new Vector3(1,1,1).normalize(), time/30);
    testMesh.matrix.makeRotationFromQuaternion(rotation);
    testMesh.updateWorldMatrix(true);

    myOrbitControler.update();
    camera.updateWorldMatrix(true);
    engine.updateViewProjection(camera);
    engine.renderObject(testMesh);
    window.requestAnimationFrame(tick);
  }

}
