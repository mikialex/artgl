import { Material, standradMeshAttributeLayout } from "../core/material";
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage } from "../core/attribute";
import { GLProgram } from "../webgl/webgl-program";
import { GLRenderer } from "../renderer/webgl-renderer";

const vertexShaderSource =
  `
    void main() {
      gl_Position = position;
      color = vertexColor;
    }
    ` 
const fragmentShaderSource =
  `
    float blue = lineColor * 0.2;
    void main() {
      gl_FragColor = color * lineColor;
    }
    `


export class TestMaterial extends Material{
  constructor() {
    super();
  }

  createProgram(renderer: GLRenderer) {
    this.programInstance = new GLProgram(renderer, {
      attributes: [
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
        { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal, stride: 3 },
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
      ],
      uniforms: [
        { name: 'lineColor', type: GLDataType.float }
      ],
      vertexShaderString: vertexShaderSource,
      fragmentShaderString: fragmentShaderSource,
      autoInjectHeader: true,
    });
    return this.programInstance;
  }
}