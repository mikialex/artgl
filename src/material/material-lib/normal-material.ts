import { Material } from "../../core/material";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { Matrix4 } from "../../math/matrix4";

const vertexShaderSource =
  `
    void main() {
      vec4 worldPosition = VPMatrix * MMatrix * vec4(position, 1.0);
      color = vec3(normal.xyz);
      gl_Position = worldPosition;
      gl_PointSize = 10.0;
    }
    ` 
const fragmentShaderSource =
  `
    void main() {
      gl_FragColor = vec4(color * 0.5 + 0.5, 1.0);
    }
    `

export class TestMaterial extends Material{
  constructor() {
    const config = {
      programConfig:{
        attributes: [
          { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
          { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal, stride: 3 },
          // { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
        ],
        uniforms: [
          { name: 'MMatrix', type: GLDataType.Mat4 , default: new Matrix4()},
          { name: 'VPMatrix', type: GLDataType.Mat4, default: new Matrix4()},
        ],
        varyings: [
          {name:'color', type: GLDataType.floatVec3}
        ],
        vertexShaderString: vertexShaderSource,
        fragmentShaderString: fragmentShaderSource,
        autoInjectHeader: true,
      }
    }
    super(config);
  }

}