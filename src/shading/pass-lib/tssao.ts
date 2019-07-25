import { Shading } from "../../core/shading";
import { GLDataType } from "../../webgl/shader-util";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { uniform, texture, innerUniform, screenQuad } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { unPackDepth } from "../../shader-graph/built-in/depth-pack";
import { dir3D } from "../../shader-graph/built-in/transform";
import { getWorldPosition, NDCxyToUV } from "../../shader-graph/built-in/transform";
import { Matrix4 } from "../../math/index";
import { rand2DT, rand } from "../../shader-graph/built-in/rand";
import { UvFragVary } from '../../shader-graph/shader-graph';

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

const tssaoMix = new ShaderFunction({
  source: `
  vec4 tssaoMix(vec3 oldColor, vec3 newColor, float sampleCount){
    return vec4((oldColor * sampleCount + newColor) / (sampleCount + 1.0), 1.0);
  }
  `
})

export class TSSAOShading extends Shading {
  update() {
    const VPMatrix = innerUniform(InnerSupportUniform.VPMatrix);
    const sampleCount = uniform("u_sampleCount", GLDataType.float).default(0);
    const depthTex = texture("depthResult");
    this.graph.reset()
      .setVertexRoot(screenQuad())
      .declareFragUV()

    const vUV = this.graph.getVary(UvFragVary);
    const depth = unPackDepth.make().input("enc", depthTex.fetch(vUV))

    const worldPosition = getWorldPosition.make()
      .input("uv", vUV)
      .input("depth", depth)
      .input("VPMatrix", VPMatrix)
      .input("VPMatrixInverse", uniform("VPMatrixInverse", GLDataType.Mat4).default(new Matrix4()))

    const Random2D1 = rand2DT.make()
      .input("cood", vUV)
      .input("t", sampleCount)
    
    const Random2D2 = rand.make()
    .input("n", Random2D1)
    
    const randDir = dir3D.make()
      .input("x", Random2D1)
      .input("y", Random2D2)

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
        .input("sampleCount", sampleCount)
    )
  }
}