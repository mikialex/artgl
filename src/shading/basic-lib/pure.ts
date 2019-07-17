import { Shading } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { InnerSupportUniform } from "../../webgl/uniform/uniform";
import { MVPTransform } from "../../shader-graph/built-in/transform";
import { innerUniform, attribute, uniform } from "../../shader-graph/node-maker";

export class PureShading extends Shading {

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
      .setVary("color", uniform("baseColor", GLDataType.floatVec4))
      .setFragmentRoot(
        this.graph.getVary("color")
      )

  }

}