import { Technique, TechniqueConfig } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { Matrix4 } from "../../math/matrix4";
import { GLTextureType } from "../../webgl/uniform/uniform-texture";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";

const vertexShaderSource =
  `
    void main() {
      gl_Position = vec4(position, 1.0);
      v_uv = uv;
    }
    `
const fragmentShaderSource =
  `
  
    float UnpackDepth( const in vec4 enc ) {
        const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
        float decoded = dot( enc, bit_shift );
        return decoded;
    }

    vec4 getWorldPosition(vec2 cood){
      float depth = UnpackDepth(texture2D(TAAHistoryOld, cood));
      return vec4(cood, depth, 1.0);
    }

    vec2 getLastPixelPosition(vec2 cood){
      vec4 worldPosition = VPMatrixInverse * getWorldPosition(cood);
      vec4 oldGPositon = LastVPMatrix * worldPosition;
      return oldGPositon.xy;
    }

    void main() {
      vec2 cood = getLastPixelPosition(v_uv);
      vec3 oldColor = texture2D(TAAHistoryOld, v_uv).rgb;
      vec3 newColor = texture2D(sceneResult, v_uv).rgb;
      // gl_FragColor = vec4((oldColor * u_sampleCount + newColor) / (u_sampleCount + 1.0), 1.0);
      // gl_FragColor = vec4((oldColor + newColor) / 2.0, 1.0);
      gl_FragColor = vec4(newColor*0.1 + (1.0 -0.1) * oldColor, 1.0);
    }
    `

export class TAATechnique extends Technique {
  constructor() {
    const config: TechniqueConfig = {
      programConfig: {
        attributes: [
          { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
          { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
        ],
        uniforms: [
          {
            name: 'u_sampleCount', default: 0, type: GLDataType.float,
          },
          {
            name: 'VPMatrixInverse', default: new Matrix4(), type: GLDataType.Mat4,
          }
        ],
        uniformsIncludes: [
          { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix,},
          { name: 'LastVPMatrix', mapInner: InnerSupportUniform.LastVPMatrix,},
        ],
        varyings: [
          {name:'v_uv', type: GLDataType.floatVec2},
        ],
        textures: [
          { name: 'TAAHistoryOld', type: GLTextureType.texture2D},
          { name: 'sceneResult', type: GLTextureType.texture2D},
          { name: 'depthResult', type: GLTextureType.texture2D},
        ],
        vertexShaderString: vertexShaderSource,
        fragmentShaderString: fragmentShaderSource,
        autoInjectHeader: true,
      }
    }
    super(config);
  }

}