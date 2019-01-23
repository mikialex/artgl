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
    void main() {
      vec3 color = texture2D(copySource, v_uv).rgb;
      gl_FragColor = vec4(color, 1.0);
    }
    `

export class CopyTechnique extends Technique {
  constructor() {
    const config: TechniqueConfig = {
      programConfig: {
        attributes: [
          { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
          { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
        ],
        varyings: [
          { name: 'v_uv', type: GLDataType.floatVec2 },
        ],
        textures: [
          { name: 'copySource', type: GLTextureType.texture2D },
        ],
        vertexShaderString: vertexShaderSource,
        fragmentShaderString: fragmentShaderSource,
        autoInjectHeader: true,
      }
    }
    super(config);
  }

}