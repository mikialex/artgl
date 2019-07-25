import { Shading } from "../../core/shading";
import { GLDataType } from "../../webgl/shader-util";
import { Matrix4 } from "../../math/matrix4";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { texture, uniform, innerUniform, screenQuad } from "../../shader-graph/node-maker";
import { NDCxyToUV, getLastPixelNDC, UVDepthToNDC } from "../../shader-graph/built-in/transform";
import { unPackDepth } from "../../shader-graph/built-in/depth-pack";
import { UvFragVary } from '../../shader-graph/shader-graph';

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

export class TAAShading extends Shading {

  update() {
    this.graph.reset()
      .setVertexRoot(screenQuad())
      .declareFragUV()

    const vUV = this.graph.getVary(UvFragVary);
    const depth = unPackDepth.make().input("enc", texture("depthResult").fetch(vUV))

    const colorOld = texture("TAAHistoryOld").fetch(
      NDCxyToUV.make().input("ndc",
        getLastPixelNDC.make()
          .input("ndc",
            UVDepthToNDC.make()
              .input("depth", depth)
              .input("uv", this.graph.getVary(UvFragVary))
          )
          .input("VPMatrixInverse", uniform("VPMatrixInverse", GLDataType.Mat4).default(new Matrix4()))
          .input("LastVPMatrix", innerUniform(InnerSupportUniform.LastVPMatrix))
      )
    )

    this.graph.setFragmentRoot(
      TAAMix.make()
        .input("oldColor", colorOld.swizzling("xyz"))
        .input("newColor", texture("sceneResult").fetch(vUV).swizzling("xyz"))
        .input("sampleCount", uniform("u_sampleCount", GLDataType.float).default(0))
    )

  }

}