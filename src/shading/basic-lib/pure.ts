import { Shading, ShaderUniformProvider } from "../../core/shading";
import { GLDataType } from "../../webgl/shader-util";
import { uniform, MVPWorld } from "../../shader-graph/node-maker";
import { ShaderGraph } from "../../shader-graph/shader-graph";

export class PureShading implements ShaderUniformProvider  {


  decorate(graph: ShaderGraph) {
    graph.reset()
      .setVertexRoot(MVPWorld())
      .setFragmentRoot(uniform("baseColor", GLDataType.floatVec4))
  }

  uniforms = new Map();

  providerName = "PureShading"

}