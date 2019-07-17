import { Shading } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { MVPTransform } from "../../shader-graph/built-in/transform";
import { innerUniform, attribute } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";


const normalShading = new ShaderFunction({
  source:
    `vec4 normalShading(vec3 color){
      return vec4(color * 0.5 + 0.5, 1.0);
    }`
})

export class NormalShading extends Shading {

  update() {
    this.graph.reset()
      .setVertexRoot(
        MVPTransform.make()
          .input("VPMatrix", innerUniform(InnerSupportUniform.VPMatrix))
          .input("MMatrix", innerUniform(InnerSupportUniform.MMatrix))
          .input("position", attribute(
            { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
          ))
      )
      .setVary("color", attribute(
        { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal }
      ))
      .setFragmentRoot(
        normalShading.make().input("color", this.graph.getVary("color"))
      )

  }

}