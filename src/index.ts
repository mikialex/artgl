import { GLRenderer } from "./renderer/webgl-renderer";
import { SceneNode } from "./scene/scene-node";
import { SphereGeometry } from "./geometry/sphere-geometry";
import { ShaderType, GLShader } from "./webgl/shader";
import { GLProgram } from "./webgl/webgl-program";
import { TestGeometry } from "./geometry/test-geometery";
import { AttributeUsage } from "./core/attribute";

window.onload = function(){

  var vertexShaderSource =
    `
    void main() {
      gl_Position = position;
      color = vec4(0.5,0.5,0.5,1);
    }
    ` ;
  
  var fragmentShaderSource =
    `
    float blue = lineColor * 0.2;
    void main() {
      gl_FragColor = color * lineColor;
    }
    `  

  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);
  console.log(renderer);


  let program = new GLProgram(renderer, 
    {
      attributes: [
        { name: 'position', stride: 3, usage: AttributeUsage.position},
      ],
      uniforms: [
        { name: 'lineColor', type: 'uniform1f' }
      ],
      varyings: [
        { name: 'color', type: 'vec4'}
      ],
      vertexShaderString: vertexShaderSource,
      fragmentShaderString: fragmentShaderSource,
      autoInjectHeader:true,
    }
  );



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

  