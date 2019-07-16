import { Technique, Shading } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { attribute, uniform, texture, innerUniform, constValue, vec4 } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { unPackDepth } from "../../shader-graph/built-in/depth-pack";
import { randDir3D } from "../../shader-graph/built-in/rand";
import { getWorldPosition, NDCxyToUV } from "../../shader-graph/built-in/transform";
import { Matrix4 } from "../../math/index";

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

const newSamplePosition = new ShaderFunction({
  source: `
  vec3 newPosition(vec3 positionOld, float distance, vec3 dir){
    return distance * dir + positionOld;
  }
  `
})

const NDCFromWorldPositionAndVPMatrix = new ShaderFunction({
  source: `
  vec3 depthFromWorldPositionAndVPMatrix(vec3 position, mat4 matrix){
    vec4 ndc = matrix * vec4(position, 1.0);
    ndc = ndc / ndc.w;
    return ndc.xyz;
  }
  `
})

const sampleAO = new ShaderFunction({
  source: `
  vec3 sampleAO(float depth, float newDepth){
    if (depth >0.999){
      return vec3(0.5);
    }
    float rate =  depth > newDepth ? 0.0 : 1.0;
    return vec3(rate);
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

export class TSSAOShading extends Shading {
  // constructor() {
  //   super({
  //     attributes: [
  //       { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
  //       { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv },
  //     ],
  //     uniforms: [
  //       { name: 'u_sampleCount', default: 0, type: GLDataType.float, },
  //       { name: 'VPMatrixInverse', default: new Matrix4(), type: GLDataType.Mat4, },
  //       { name: 'u_aoRadius', default: 1.0, type: GLDataType.float, },
  //     ],
  //     uniformsIncludes: [
  //       { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, },
  //       { name: 'LastVPMatrix', mapInner: InnerSupportUniform.LastVPMatrix, },
  //     ],
  //     textures: [
  //       { name: 'depthResult', type: GLTextureType.texture2D },
  //       { name: 'AOAcc', type: GLTextureType.texture2D },
  //     ],
  //     vertexShaderMain: vertexShaderSource,
  //     fragmentShaderMain: fragmentShaderSource,
  //     fragmentShaderIncludes: fragInclude
  //   });
  // }


  update() {
    const VPMatrix = innerUniform(InnerSupportUniform.VPMatrix);
    const depthTex = texture("depthResult");
    this.graph.reset()
      .setVertexRoot(
        vec4(attribute(
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
      ), constValue(1)))
      .setVary("v_uv", attribute(
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv }
      ))

    const vUV = this.graph.getVary("v_uv");
    const depth = unPackDepth.make().input("enc", depthTex.fetch(vUV))

    const worldPosition = getWorldPosition.make()
      .input("uv", vUV)
      .input("depth", depth)
      .input("VPMatrix", VPMatrix)
      .input("VPMatrixInverse", uniform("VPMatrixInverse", GLDataType.Mat4).default(new Matrix4()))

    const randDir = randDir3D.make()
      .input("randA", vUV.swizzling("x"))
      .input("randB", vUV.swizzling("y"))

    const newPositionRand = newSamplePosition.make()
      .input("positionOld", worldPosition.swizzling("xyz"))
      .input("distance", uniform("u_aoRadius", GLDataType.float).default(1))
      .input("dir", randDir)

    const newDepth = unPackDepth.make()
      .input("enc",
        depthTex.fetch(
          NDCxyToUV.make()
            .input(
              "ndc", NDCFromWorldPositionAndVPMatrix.make()
                .input(
                  "position", newPositionRand
                ).input(
                  "matrix", VPMatrix
                )
            )
        )
      )

    this.graph.setFragmentRoot(
      tssaoMix.make()
        .input("oldColor", texture("AOAcc").fetch(vUV).swizzling("xyz"))
        .input("newColor",
          sampleAO.make()
            .input("depth", depth)
            .input("newDepth", newDepth)
        )
        .input("sampleCount", uniform("u_sampleCount", GLDataType.float).default(0))
    )
  }

}