import { GLRenderer } from "./renderer/webgl-renderer";
import { GLProgram } from "./webgl/program";
import { TestGeometry } from "./geometry/test-geometery";
import { ARTEngine } from "./renderer/render-engine";
import { Mesh } from "./object/mesh";
import { TestMaterial } from "./material/test-material";
import { Matrix4, Quaternion, Vector3 } from "./math";
import { PerspectiveCamera } from "./camera/perspective-camera";

window.onload = function () {

  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);
  const engine = new ARTEngine(renderer);
  const camera = new PerspectiveCamera();
  camera.worldMatrix.setPostion(0, 0, 10);
  engine.updateViewProjection(camera);


  let testGeo = new TestGeometry();
  let testMat = new TestMaterial();

  let testMesh = new Mesh(testGeo, testMat);
  const rotation = (new Quaternion()).setFromAxisAngle(new Vector3(1,1,1).normalize(), 1.4);
  testMesh.matrix.makeRotationFromQuaternion(rotation);
  testMesh.updateMatrixWorld();

  engine.renderObject(testMesh);

  window.requestAnimationFrame(tick);
  let frame = 0;
  function tick() {
    frame++;
    engine.renderObject(testMesh);
    if (frame < 100) {
      window.requestAnimationFrame(tick);
    }
  }

}

  