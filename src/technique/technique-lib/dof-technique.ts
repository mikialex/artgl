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
      v_uv = uv;
    }
    `
const fragmentShaderSource =
  `
    void main() {
      float depthColorBuffer = texture2D(depthBuffer, v_uv).r;
      vec3 normalBuffer = texture2D(sceneBuffer, v_uv).rgb;
      gl_FragColor = vec4(vec3(depthColorBuffer) + normalBuffer, 1.0);
      // gl_FragColor = vec4(vec3(1.0,0.0,0.0), 1.0);
    }
    `

export class DOFTechnique extends Technique {
  constructor() {
    const config = {
      programConfig: {
        attributes: [
          { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
          { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
        ],
        uniforms: [
          { name: 'MMatrix', type: GLDataType.Mat4, default: new Matrix4() },
          { name: 'VPMatrix', type: GLDataType.Mat4, default: new Matrix4() },
        ],
        varyings: [
          { name: 'depth', type: GLDataType.float },
          {name:'v_uv', type: GLDataType.floatVec2},
        ],
        textures: [
          {name: 'depthBuffer', type: GLTextureType.texture2D},
          {name: 'sceneBuffer', type: GLTextureType.texture2D}
        ],
        vertexShaderString: vertexShaderSource,
        fragmentShaderString: fragmentShaderSource,
        autoInjectHeader: true,
      }
    }
    super(config);
  }

}