import { GLRenderer } from "./renderer/webgl-renderer";
import { GLProgram } from "./webgl/webgl-program";
import { TestGeometry } from "./geometry/test-geometery";
import { AttributeUsage } from "./core/attribute";
import { generateStandradProgramConfig } from "./webgl/program-factory";
import { ARTEngine } from "./renderer/render-engine";
import { ReactiveStore } from './store/reactive-store';
import { Mesh } from "./object/mesh";
import { TestMaterial } from "./material/test-material";
import { Matrix4 } from "./math";
import { PerspectiveCamera } from "./camera/perspective-camera";

window.onload = function () {



  // var worker = new Worker()
  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);
  const engine = new ARTEngine(renderer);
  const camera = new PerspectiveCamera();
  engine.setCamera(camera, new Matrix4());


  let testGeo = new TestGeometry();
  let testMat = new TestMaterial();

  let testMesh = new Mesh(testGeo, testMat);
  
  engine.renderList.addRenderItem(testMesh, new Matrix4());

  engine.render();


  // const testProgramConf = generateStandradProgramConfig();
  // let program = new GLProgram(renderer, testProgramConf);

  // program.setGeometryData(testGeo);
  // // program.setUniform('lineColor', 0.1);

  // renderer.useProgram(program);
  // renderer.render();
  // // renderer.clear();


  // window.requestAnimationFrame(tick);
  // let frame = 0;
  // function tick() {
  //   frame++;
  //   // program.setUniform('lineColor', Math.sin(frame/10));
  //   renderer.render();
  //   window.requestAnimationFrame(tick);
  // }

}

  