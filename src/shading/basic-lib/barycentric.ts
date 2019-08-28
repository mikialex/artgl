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


export class BarycentricWireFrame extends BaseEffectShading<BarycentricWireFrame> {

  @MapUniform("barycentricLine_threshold")
  barycentricLine_threshold: number = 0.01;


  decorate(graph: ShaderGraph): void {
    const barCentric = attribute(CommonAttribute.baryCentric, GLDataType.floatVec3);

    graph
      .setVary("v_barCentric", barCentric)
      .setFragmentRoot(
        addBarycentricWireFrame.make()
          .input("origin", graph.getFragRoot())
          .input("barycentric_co", graph.getVary("v_barCentric"))
          .input("threshold", this.getPropertyUniform('barycentricLine_threshold'))
          .input("lineColor", constValue(new Vector3(0, 0, 0)))
      )
  }

}