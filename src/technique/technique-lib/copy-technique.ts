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
      vec3 color = texture2D(copySource, v_uv).rgb;
      gl_FragColor = vec4(color, 1.0);
    }
    `

export class CopyTechnique extends Technique {
  constructor() {
    super({
      attributes: [
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv },
      ],
      varyings: [
        { name: 'v_uv', type: GLDataType.floatVec2 },
      ],
      textures: [
        { name: 'copySource', type: GLTextureType.texture2D },
      ],
      vertexShaderMain: vertexShaderSource,
      fragmentShaderMain: fragmentShaderSource,
    }
    );
  }

}