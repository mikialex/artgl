import { GLRenderer } from "./renderer/webgl-renderer";
import { SceneNode } from "./scene/scene-node";
import { SphereGeometry } from "./geometry/sphere-geometry";
import { ShaderType, GLShader } from "./webgl/shader";
import { GLProgram } from "./webgl/webgl-program";
import { TestGeometry } from "./geometry/test-geometery";

window.onload = function(){

  var vertexShaderSource =
    `
    void main() {
      gl_Position = position;
      color = vec4(0,1,0,1);
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
        { name: 'position', stride: 3 },
      ],
      uniforms: [
        { name: 'lineColor', type: 'uniform1f' }
      ],
      varyings: [
        { name: 'color', type: 'vec4'}
      ],
      usageMap:{position:'position'},
      vertexShaderString: vertexShaderSource,
      fragmentShaderString: fragmentShaderSource,
      autoInjectHeader:true,
    }
  );



  let testGeo = new TestGeometry();

  program.setGeometryData(testGeo);

  program.setUniform('lineColor', 0.8);

  renderer.useProgram(program);
  renderer.render();
  // renderer.clear();

}
  