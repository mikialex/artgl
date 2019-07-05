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

const fragInclude = `
    float UnpackDepth( const in vec4 enc ) {
        const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
        float decoded = dot( enc, bit_shift );
        return decoded;
    }

    vec4 getWorldPosition(vec2 cood, float depth){
      float clipW = VPMatrix[2][3] * depth + VPMatrix[3][3];
      return VPMatrixInverse * (vec4(cood * 2.0 - 1.0, depth, 1.0) * clipW);
    }

    float rand(float n) {return fract(sin(n) * 43758.5453123);}
    const float PI = 3.14159265;

    vec3 randDir(){
      float lambda = acos(2.0 * rand(v_uv.x * v_uv.y + u_sampleCount) - 1.0) - PI / 2.0;
      float phi = 2.0 * PI * rand(v_uv.y + u_sampleCount);
      return vec3(
        cos(lambda) * cos(phi),
        cos(lambda) * sin(phi),
        sin(lambda)
      );
    }

    vec3 sampleAO(vec2 cood){
      float depth =  UnpackDepth(texture2D(depthResult, cood));
      if (depth >0.999){
        return vec3(0.5);
      }
      vec4 worldPosition = getWorldPosition(cood, depth);
      worldPosition = worldPosition/ worldPosition.w;
      vec4 newSamplePosition = vec4(u_aoRadius * rand(cood.x + u_sampleCount) * randDir(), 0.0) + worldPosition;
      // vec4 newSamplePosition = vec4(u_aoRadius * randDir(), 0.0) + worldPosition;
      vec4 newNDC = VPMatrix * newSamplePosition;
      newNDC = newNDC / newNDC.w;
      float newDepth = UnpackDepth(texture2D(depthResult, vec2(newNDC.x / 2.0 + 0.5, newNDC.y / 2.0 + 0.5)));
      float rate =  newNDC.z > newDepth ? 0.0 : 1.0;
      return vec3(rate);
    }

`;


const fragmentShaderSource =
  `
    void main() {
      vec3 oldColor = texture2D(AOAcc, v_uv).rgb;
      vec3 newColor = sampleAO(v_uv);
      gl_FragColor = vec4((oldColor * u_sampleCount + newColor) / (u_sampleCount + 1.0), 1.0);
    }
    `

export class SSAOTechnique extends Technique {
  constructor() {
    super({
      attributes: [
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv },
      ],
      uniforms: [
        { name: 'u_sampleCount', default: 0, type: GLDataType.float, },
        { name: 'VPMatrixInverse', default: new Matrix4(), type: GLDataType.Mat4, },
        { name: 'u_aoRadius', default: 1.0, type: GLDataType.float, },
      ],
      uniformsIncludes: [
        { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, },
        { name: 'LastVPMatrix', mapInner: InnerSupportUniform.LastVPMatrix, },
      ],
      varyings: [
        { name: 'v_uv', type: GLDataType.floatVec2 },
      ],
      textures: [
        { name: 'depthResult', type: GLTextureType.texture2D },
        { name: 'AOAcc', type: GLTextureType.texture2D },
      ],
      vertexShaderMain: vertexShaderSource,
      fragmentShaderMain: fragmentShaderSource,
      fragmentShaderIncludes: fragInclude
    });
  }

}