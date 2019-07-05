import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { GLTextureType } from "../../webgl/uniform/uniform-texture";

const vertexShaderSource =
  `
    void main() {
      gl_Position = vec4(position, 1.0);
      v_uv = uv;
    }
    `
const fragmentShaderSource =
  `
    void main() {
      vec3 color = texture2D(basic, v_uv).rgb;
      vec3 aocolor = texture2D(tssao, v_uv).rgb;
      aocolor = vec3(1.0) - u_tssaoComposeRate * (vec3(1.0) - aocolor) * vec3(min(u_sampleCount / u_tssaoShowThreshold, 1.0));
      aocolor = clamp(aocolor + vec3(u_tssaoComposeThreshold), vec3(0.0), vec3(1.0));
      gl_FragColor = vec4(color * aocolor, 1.0);
    }
    `

export class BlendTechnique extends Technique {
  constructor() {
    super({
      attributes: [
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv },
      ],
      uniforms: [
        { name: 'u_tssaoComposeRate', default: 1.0, type: GLDataType.float },
        { name: 'u_tssaoComposeThreshold', default: 0.5, type: GLDataType.float },
        { name: 'u_tssaoShowThreshold', default: 200, type: GLDataType.float },
        { name: 'u_sampleCount', default: 0, type: GLDataType.float },
      ],
      varyings: [
        { name: 'v_uv', type: GLDataType.floatVec2 },
      ],
      textures: [
        { name: 'basic', type: GLTextureType.texture2D },
        { name: 'tssao', type: GLTextureType.texture2D },
      ],
      vertexShaderMain: vertexShaderSource,
      fragmentShaderMain: fragmentShaderSource,
    });
  }

}