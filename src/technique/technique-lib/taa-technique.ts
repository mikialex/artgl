import { Technique } from "../../core/technique";
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

    vec4 getNDCPosition(vec2 cood){
      float depth = UnpackDepth(texture2D(depthResult, cood));
      return vec4(cood, depth, 1.0);
    }

    vec2 getLastPixelPosition(vec2 cood){
      vec4 ndcPosition = getNDCPosition(cood);
      if(ndcPosition.z > 0.99){ // we consider frag too far is background
        return cood;
      }
      vec4 worldPosition = VPMatrixInverse * ndcPosition;
      vec4 oldGPositon = LastVPMatrix * worldPosition;
      return  oldGPositon.xy / oldGPositon.w;
    }

    vec3 getClampColor(vec2 cood, vec3 colorToClamp){
      vec3 right = texture2D(sceneResult, cood + vec2(screenPixelXStep, 0.)).rgb;
      vec3 left = texture2D(sceneResult, cood + vec2(-screenPixelXStep, 0.)).rgb;
      vec3 top = texture2D(sceneResult, cood + vec2(0., screenPixelYStep)).rgb;
      vec3 bottom = texture2D(sceneResult, cood + vec2(0., -screenPixelYStep)).rgb;
      vec3 max = max(max(max(left, right), top), bottom);
      vec3 min = min(min(min(left, right), top), bottom);
      return clamp(colorToClamp, min, max);
    }

`


const fragmentShaderSource =
  `

    void main() {
      vec2 cood = getLastPixelPosition(v_uv);
      vec3 oldColor = texture2D(TAAHistoryOld, cood).rgb;
      vec3 newColor = texture2D(sceneResult, v_uv).rgb;
      // if(abs(lightness(newColor) - lightness(oldColor)) > 0.1){
      //   rate = 1.0;
      // }
      float rate = 0.05;
      if(u_sampleCount < 0.1){
        vec3 clampedOldColor = getClampColor(v_uv, oldColor);
        gl_FragColor = vec4(newColor * rate + (1.0 - rate) * clampedOldColor, 1.0);
      } else{
        gl_FragColor = vec4((oldColor * u_sampleCount + newColor) / (u_sampleCount + 1.0), 1.0);
      }
      // gl_FragColor = vec4(newColor, 1.0);
      // gl_FragColor = vec4(newColor * rate + (1.0 - rate) * oldColor, 1.0);
      // gl_FragColor = vec4((oldColor * u_sampleCount + newColor) / (u_sampleCount + 1.0), 1.0);
    }
    `

export class TAATechnique extends Technique {
  constructor() {
    super({
      attributes: [
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv },
      ],
      uniforms: [
        {
          name: 'u_sampleCount', default: 0, type: GLDataType.float,
        },
        {
          name: 'VPMatrixInverse', default: new Matrix4(), type: GLDataType.Mat4,
        },
        {
          name: 'screenPixelXStep', default: 1 / 1000, type: GLDataType.float,
        },
        {
          name: 'screenPixelYStep', default: 1 / 1000, type: GLDataType.float,
        }
      ],
      uniformsIncludes: [
        { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, },
        { name: 'LastVPMatrix', mapInner: InnerSupportUniform.LastVPMatrix, },
      ],
      varyings: [
        { name: 'v_uv', type: GLDataType.floatVec2 },
      ],
      textures: [
        { name: 'TAAHistoryOld', type: GLTextureType.texture2D },
        { name: 'sceneResult', type: GLTextureType.texture2D },
        { name: 'depthResult', type: GLTextureType.texture2D },
      ],
      vertexShaderMain: vertexShaderSource,
      fragmentShaderMain: fragmentShaderSource,
      fragmentShaderIncludes: fragInclude
    });
  }

}