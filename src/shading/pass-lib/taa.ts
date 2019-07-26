import { BaseEffectShading, MapUniform } from "../../core/shading";
import { Matrix4 } from "../../math/matrix4";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { texture, innerUniform, screenQuad } from "../../shader-graph/node-maker";
import { NDCxyToUV, getLastPixelNDC, UVDepthToNDC } from "../../shader-graph/built-in/transform";
import { unPackDepth } from "../../shader-graph/built-in/depth-pack";
import { UvFragVary, ShaderGraph } from '../../shader-graph/shader-graph';

const TAAMix = new ShaderFunction({
  source:
    `
  vec4 TAAMix (vec3 oldColor, vec3 newColor, float sampleCount){
    float rate = 0.05;
    // return vec4(newColor * rate + (1.0 - rate) * oldColor, 1.0);
    
    return vec4((oldColor * sampleCount + newColor) / (sampleCount + 1.0), 1.0);

    // need figure out how to clamp color
    // if(sampleCount < 0.1){
    //   // vec3 clampedOldColor = getClampColor(v_uv, oldColor);
    //   // return vec4(newColor * rate + (1.0 - rate) * clampedOldColor, 1.0);
    //   return vec4(newColor * rate + (1.0 - rate) * oldColor, 1.0);
    // } else{
    //   return vec4((oldColor * sampleCount + newColor) / (sampleCount + 1.0), 1.0);
    // }

  }
    `
})

export class TAAShading extends BaseEffectShading<TAAShading> {

  @MapUniform("VPMatrixInverse")
  VPMatrixInverse: Matrix4 = new Matrix4()

  @MapUniform("u_sampleCount")
  sampleCount: number = 0;

  decorate(graph: ShaderGraph) {
    graph
      .setVertexRoot(screenQuad())
      .declareFragUV()

    const vUV = graph.getVary(UvFragVary);
    const depth = unPackDepth.make().input("enc", texture("depthResult").fetch(vUV))

    const colorOld = texture("TAAHistoryOld").fetch(
      NDCxyToUV.make().input("ndc",
        getLastPixelNDC.make()
          .input("ndc",
            UVDepthToNDC.make()
              .input("depth", depth)
              .input("uv", graph.getVary(UvFragVary))
          )
          .input("VPMatrixInverse", this.getPropertyUniform("VPMatrixInverse"))
          .input("LastVPMatrix", innerUniform(InnerSupportUniform.LastVPMatrix))
      )
    )

    graph.setFragmentRoot(
      TAAMix.make()
        .input("oldColor", colorOld.swizzling("xyz"))
        .input("newColor", texture("sceneResult").fetch(vUV).swizzling("xyz"))
        .input("sampleCount", this.getPropertyUniform("sampleCount"))
    )

  }

}