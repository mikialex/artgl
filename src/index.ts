import { GLRenderer } from "./renderer/webgl-renderer";
import { GLProgram } from "./webgl/webgl-program";
import { TestGeometry } from "./geometry/test-geometery";
import { AttributeUsage } from "./core/attribute";
import { generateStandradProgramConfig } from "./webgl/program-factory";

window.onload = function(){

  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);

  const testProgramConf = generateStandradProgramConfig();
  let program = new GLProgram(renderer, testProgramConf);

  let testGeo = new TestGeometry();
  program.setGeometryData(testGeo);
  program.setUniform('lineColor', 0.1);

  renderer.useProgram(program);
  renderer.render();
  // renderer.clear();


  window.requestAnimationFrame(tick);
  let frame = 0;
  function tick() {
    frame++;
    program.setUniform('lineColor', Math.sin(frame/10));
    renderer.render();
    window.requestAnimationFrame(tick);
  }

}

  