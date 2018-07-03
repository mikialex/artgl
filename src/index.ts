import { GLRenderer } from "./renderer/webgl-renderer";
import { GLProgram } from "./webgl/webgl-program";
import { TestGeometry } from "./geometry/test-geometery";
import { AttributeUsage } from "./core/attribute";
import { generateStandradProgramConfig } from "./webgl/program-factory";
import { ARTEngine } from "./renderer/render-engine";
import { ReactiveStore } from './store/reactive-store';

window.onload = function () {
  (window as any).store = new ReactiveStore({
    state: {
      targetFps: 60,
      fps: 30,
    },
    getters: {
      enableCulling() {
        return this.fps < this.targetFps;
      },
      cullingRatio() {
        if (this.enableCulling) {
          return this.targetFps - this.fps;
        }
      }
    },
    watcher: {
      enableCulling(newVal, oldVal) {
        // ...
      }
    },
    // mutation: {
    //   updateFps(val) {
    //     this.state.fps = val;
    //   }
    // }
  });


  // var worker = new Worker()
  // let canv = document.querySelector('canvas');
  // let renderer = new GLRenderer(canv);
  // const engine = new ARTEngine(renderer);
  // // engine.renderList.addRenderItem();

  // const testProgramConf = generateStandradProgramConfig();
  // let program = new GLProgram(renderer, testProgramConf);

  // let testGeo = new TestGeometry();
  // program.setGeometryData(testGeo);
  // program.setUniform('lineColor', 0.1);

  // renderer.useProgram(program);
  // renderer.render();
  // // renderer.clear();


  // window.requestAnimationFrame(tick);
  // let frame = 0;
  // function tick() {
  //   frame++;
  //   program.setUniform('lineColor', Math.sin(frame/10));
  //   renderer.render();
  //   window.requestAnimationFrame(tick);
  // }

}

  