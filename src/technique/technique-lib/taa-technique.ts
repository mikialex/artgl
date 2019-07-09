import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { Matrix4 } from "../../math/matrix4";
import { GLTextureType } from "../../webgl/uniform/uniform-texture";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { attribute, texture, uniform, innerUniform } from "../../shader-graph/node-maker";
import { NDCxyToUV, getLastPixelNDC, UVDepthToNDC } from "../../shader-graph/built-in/transform";


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

const TAAMix = new ShaderFunction({
  source:
    `
  vec4 TAAMix (vec3 oldColor, vec3 newColor, float sampleCount){
    float rate = 0.05;
    if(sampleCount < 0.1){
      vec3 clampedOldColor = getClampColor(v_uv, oldColor);
      return vec4(newColor * rate + (1.0 - rate) * clampedOldColor, 1.0);
    } else{
      return vec4((oldColor * sampleCount + newColor) / (sampleCount + 1.0), 1.0);
    }
  }
    `
})


const fragmentShaderSource =
  `

    void main() {
      vec2 cood = getLastPixelPosition(v_uv);
      vec3 oldColor = texture2D(TAAHistoryOld, cood).rgb;
      vec3 newColor = texture2D(sceneResult, v_uv).rgb;

      float rate = 0.05;

      if(u_sampleCount < 0.1){
        vec3 clampedOldColor = getClampColor(v_uv, oldColor);
        gl_FragColor = vec4(newColor * rate + (1.0 - rate) * clampedOldColor, 1.0);
      } else{
        gl_FragColor = vec4((oldColor * u_sampleCount + newColor) / (u_sampleCount + 1.0), 1.0);
      }

    }
    `

export class TAATechnique extends Technique {
  // constructor() {
  //   super({
  //     attributes: [
  //       { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
  //       { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv },
  //     ],
  //     uniforms: [
  //       {
  //         name: 'u_sampleCount', default: 0, type: GLDataType.float,
  //       },
  //       {
  //         name: 'VPMatrixInverse', default: new Matrix4(), type: GLDataType.Mat4,
  //       },
  //       {
  //         name: 'screenPixelXStep', default: 1 / 1000, type: GLDataType.float,
  //       },
  //       {
  //         name: 'screenPixelYStep', default: 1 / 1000, type: GLDataType.float,
  //       }
  //     ],
  //     uniformsIncludes: [
  //       { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, },
  //       { name: 'LastVPMatrix', mapInner: InnerSupportUniform.LastVPMatrix, },
  //     ],
  //     varyings: [
  //       { name: 'v_uv', type: GLDataType.floatVec2 },
  //     ],
  //     textures: [
  //       { name: 'TAAHistoryOld', type: GLTextureType.texture2D },
  //       { name: 'sceneResult', type: GLTextureType.texture2D },
  //       { name: 'depthResult', type: GLTextureType.texture2D },
  //     ],
  //     vertexShaderMain: vertexShaderSource,
  //     fragmentShaderMain: fragmentShaderSource,
  //     fragmentShaderIncludes: fragInclude
  //   });
  // }

  update() {
    this.graph.reset()
    .setVertexRoot(attribute(
      { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
    ))
    .setVary("v_uv",attribute(
      { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv }
    ))

    const colorOld = texture("TAAHistoryOld").fetch(
      NDCxyToUV.make().input("ndc",
        getLastPixelNDC.make()
          .input("ndc",
            UVDepthToNDC.make()
              .input("depth", texture("depthResult").fetch(this.graph.getVary("v_uv")))
              .input("uv", this.graph.getVary("v_uv"))
            )
          .input("VPMatrixInverse",  uniform("VPMatrixInverse", GLDataType.Mat4))
          .input("LastVPMatrix", innerUniform(InnerSupportUniform.LastVPMatrix))
      )
    )

    this.graph.setFragmentRoot(
        TAAMix.make()
          .input("oldColor", colorOld)
          .input("newColor", texture("sceneResult").fetch(this.graph.getVary("v_uv")))
          .input("sampleCount", uniform("u_sampleCount", GLDataType.float))
    )
    
  }

}