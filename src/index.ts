import { GLRenderer } from "./renderer/webgl-renderer";
import { Geometry } from "./core/geometry";
import { SceneNode } from "./scene/scene-node";
import { SphereGeometry } from "./geometry/sphere-geometry";
import { ShaderType, GLShader } from "./webgl/shader";
import { GLProgram } from "./webgl/webgl-program";

window.onload = function(){

  var vertexShaderSource =
    `
    varying vec4 color;
    attribute vec4 position;
    attribute vec4 vertexColor;
    void main() {
      gl_Position = position;
      color = vertexColor;
    }
    ` ;
  
  var fragmentShaderSource =
    `
    precision mediump float;
    uniform float lineColor;
    varying vec4 color;
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
        { name:'vertexColor', stride: 3}
      ],
      uniforms: [
        { name: 'lineColor', type: 'uniform1f' }
      ],
      vertexShaderString: vertexShaderSource,
      fragmentShaderString: fragmentShaderSource,
      autoInjectHeader:false,
    }
  );



  let testGeo = new Geometry();

  program.setAttribute('position', testGeo.createTestVertices());
  program.setAttribute('vertexColor', testGeo.createTestVerticesColors());

  program.setUniform('lineColor', 0.8);

  renderer.render();
  // renderer.clear();

}
  