import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { Matrix4 } from "../../math/matrix4";

const vertexShaderSource =
  `
    void main() {
      vec4 worldPosition = VPMatrix * MMatrix * vec4(position, 1.0);
      depth = worldPosition.z / worldPosition.w;
      gl_Position = worldPosition;
    }
    `
const fragmentShaderSource =
  `
    void main() {
      // gl_FragColor = vec4(vec3(depth / 1.0), 1.0);
      gl_FragColor = vec4(vec3(0.5), 1.0);
    }
    `

export class DepthTechnique extends Technique {
  constructor() {
    const config = {
      programConfig: {
        attributes: [
          { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
        ],
        uniforms: [
          { name: 'MMatrix', type: GLDataType.Mat4, default: new Matrix4() },
          { name: 'VPMatrix', type: GLDataType.Mat4, default: new Matrix4() },
        ],
        varyings: [
          { name: 'depth', type: GLDataType.float }
        ],
        vertexShaderString: vertexShaderSource,
        fragmentShaderString: fragmentShaderSource,
        autoInjectHeader: true,
      }
    }
    super(config);
  }

}