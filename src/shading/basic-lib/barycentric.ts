import { BaseEffectShading, MapUniform, MarkNeedRedecorate } from "../../core/shading";
import { ShaderGraph } from "../../shader-graph/shader-graph";
import { constValue, attribute } from "../../shader-graph/node-maker";
import { CommonAttribute } from "../../webgl/attribute";
import { GLDataType } from "../../webgl/shader-util";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { Vector3 } from "../../math";

const addBarycentricWireFrame = new ShaderFunction({
  source:
    `
  vec4 addBarycentricWireFrame(vec4 origin, vec3 barycentric_co, float threshold, vec3 lineColor){
    if(
      barycentric_co.x > threshold &&
      barycentric_co.y > threshold &&
      barycentric_co.z > threshold
      ){
      return origin;
    }
    else{
      return vec4(lineColor, 1);
    }
    // return vec4(vec3(barycentric_co.x), 1.0);
  }
  
    `
})

const addBarycentricWireFrameScreenSpace = new ShaderFunction({
  source:
    `
  vec4 addBarycentricWireFrame(vec4 origin, vec3 barycentric_co, vec3 lineColor){
    vec3 d = fwidth(barycentric_co);
    vec3 a3 = smoothstep(vec3(0.0), d*2.0, barycentric_co);
    return mix(vec4(lineColor, 1.0), origin, min(min(a3.x, a3.y), a3.z));
  }
  
    `,
  needDerivative: true
})


export class BarycentricWireFrame extends BaseEffectShading<BarycentricWireFrame> {

  @MapUniform("barycentricLine_threshold")
  barycentricLine_threshold: number = 0.01;

  @MarkNeedRedecorate()
  useScreenSpace: boolean = false;

  getWireFrameType(graph: ShaderGraph) {
    if (this.useScreenSpace) {
      return addBarycentricWireFrameScreenSpace.make()
        .input("origin", graph.getFragRoot())
        .input("barycentric_co", graph.getVary("v_barCentric"))
        .input("lineColor", constValue(new Vector3(0, 0, 0)))
    } else {
      return addBarycentricWireFrame.make()
        .input("origin", graph.getFragRoot())
        .input("barycentric_co", graph.getVary("v_barCentric"))
        .input("threshold", this.getPropertyUniform('barycentricLine_threshold'))
        .input("lineColor", constValue(new Vector3(0, 0, 0)))
    }
  }

  decorate(graph: ShaderGraph): void {
    const barCentric = attribute(CommonAttribute.baryCentric, GLDataType.floatVec3);

    graph
      .setVary("v_barCentric", barCentric)
      .setFragmentRoot(this.getWireFrameType(graph))
  }

}