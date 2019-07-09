import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { Matrix4 } from "../../math/matrix4";
import { GLTextureType } from "../../webgl/uniform/uniform-texture";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { attribute, uniform } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";

const vertexShaderSource =
  `
    void main() {
      gl_Position = vec4(position, 1.0);
      v_uv = uv;
    }
    `

const fragInclude = `

    const float PI = 3.14159265;

    vec3 sampleAO(vec2 cood){
      float depth =  UnpackDepth(texture2D(depthResult, cood));
      if (depth >0.999){
        return vec3(0.5);
      }
      vec4 worldPosition = getWorldPosition(cood, depth);
      worldPosition = worldPosition/ worldPosition.w;
      vec4 newSamplePosition = vec4(u_aoRadius * rand(cood.x + u_sampleCount) * randDir(), 0.0) + worldPosition;
      vec4 newNDC = VPMatrix * newSamplePosition;
      newNDC = newNDC / newNDC.w;
      float newDepth = UnpackDepth(texture2D(depthResult, vec2(newNDC.x / 2.0 + 0.5, newNDC.y / 2.0 + 0.5)));
      float rate =  newNDC.z > newDepth ? 0.0 : 1.0;
      return vec3(rate);
    }

`;

const getWorldPosition = new ShaderFunction({
  source:
    `
    vec4 getWorldPosition(
      vec2 cood, 
      float depth, 
      mat4 VPMatrix, 
      mat4 VPMatrixInverse){
      float clipW = VPMatrix[2][3] * depth + VPMatrix[3][3];
      return VPMatrixInverse * (vec4(cood * 2.0 - 1.0, depth, 1.0) * clipW);
    }
    `
})


const fragmentShaderSource =
  `
    void main() {
      vec3 oldColor = texture2D(AOAcc, v_uv).rgb;
      vec3 newColor = sampleAO(v_uv);
      gl_FragColor = vec4((oldColor * u_sampleCount + newColor) / (u_sampleCount + 1.0), 1.0);
    }
    `

const tssaoMix = new ShaderFunction({
  source: `
  vec4 tssaoMix(vec3 oldColor, vec3 newColor, float sampleCount){
    return vec4((oldColor * sampleCount + newColor) / (sampleCount + 1.0), 1.0);
  }
  `
})

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
      textures: [
        { name: 'depthResult', type: GLTextureType.texture2D },
        { name: 'AOAcc', type: GLTextureType.texture2D },
      ],
      vertexShaderMain: vertexShaderSource,
      fragmentShaderMain: fragmentShaderSource,
      fragmentShaderIncludes: fragInclude
    });
  }


  update() {

    const oldColor = ;
    const newColor = ;

    this.graph.reset()
      .setVertexRoot(attribute(
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
      ))
      .setVary("v_uv",attribute(
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv }
      ))
      .setFragmentRoot(
        tssaoMix.make()
          .input("oldColor", oldColor)
          .input("newColor", newColor)
          .input("sampleCount", uniform("u_sampleCount", GLDataType.float))
      )
  }

}