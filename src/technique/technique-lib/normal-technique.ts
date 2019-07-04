import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";

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

export class NormalTechnique extends Technique{
  constructor() {
    super({
      attributes: [
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
        { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal },
      ],
      uniformsIncludes: [
        { name: 'MMatrix', mapInner: InnerSupportUniform.MMatrix, },
        { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, }
      ],
      varyings: [
        { name: 'color', type: GLDataType.floatVec3 }
      ],
      vertexShaderMain: vertexShaderSource,
      fragmentShaderMain: fragmentShaderSource,
    });
  }

}