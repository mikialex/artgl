import {  Shading } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { MVPTransform } from "../../shader-graph/built-in/transform";
import { innerUniform, attribute } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { depthPack } from "../../shader-graph/built-in/depth-pack";


const depthV = new ShaderFunction(
  {
    source: `
    float depthVary(vec4 worldPosition){
      return worldPosition.z / worldPosition.w;
    }
    `}
)

export class DepthShading extends Shading {
  name = "drawDepth"

  update() {
    const worldPosition = MVPTransform.make()
      .input("VPMatrix", innerUniform(InnerSupportUniform.VPMatrix))
      .input("MMatrix", innerUniform(InnerSupportUniform.MMatrix))
      .input("position", attribute(
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
      ))

    this.graph.reset()
      .setVertexRoot(worldPosition)
      .setVary("depth", depthV.make().input("worldPosition", worldPosition))
      .setFragmentRoot(
        depthPack.make().input("frag_depth", this.graph.getVary("depth"))
      )
  }

}