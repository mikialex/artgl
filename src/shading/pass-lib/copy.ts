import { Shading } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { attribute, texture, vec4, constValue } from "../../shader-graph/node-maker";

export class CopyShading extends Shading {

  update() {
    this.graph.reset()
      .setVertexRoot(vec4(attribute(
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
      ), constValue(1)))
      .setVary("v_uv", attribute(
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv }
      ))
      .setFragmentRoot(
        texture("copySource")
          .fetch(this.graph.getVary("v_uv"))
      )

  }
}