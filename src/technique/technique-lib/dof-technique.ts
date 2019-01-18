import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { Matrix4 } from "../../math/matrix4";
import { GLTextureType } from "../../webgl/gl-texture";

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
      float depthColorBuffer = texture2D(depthBuffer, gl_FragCoord.xy).r;
      gl_FragColor = vec4(vec3(depthColorBuffer / 10.0), 1.0);
      // gl_FragColor = vec4(vec3(1.0,0.0,0.0), 1.0);
    }
    `

export class DOFTechnique extends Technique {
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
        textures: [
          {name: 'depthBuffer', type: GLTextureType.texture2D}
        ],
        vertexShaderString: vertexShaderSource,
        fragmentShaderString: fragmentShaderSource,
        autoInjectHeader: true,
      }
    }
    super(config);
  }

}