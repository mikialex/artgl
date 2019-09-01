import { BaseEffectShading, MapUniform } from "../../core/shading";
import { ShaderGraph } from "../../artgl";
import { Vector2 } from "../../math/vector2";
import { ShaderFunction } from "../../shader-graph/shader-function";

const progressiveDof = new ShaderFunction({
  source: `
  vec4 patchDof(
    vec4 positionOld,
    vec2 cocPoint,
    float focusLength,
    ){
    vec4 newPosition = positionOld;
    newPosition.xy += cocPoint * (positionOld.z - focusLength);
    return newPosition;
  }
  
  `
})


export class ProgressiveDof extends BaseEffectShading<ProgressiveDof> {

  @MapUniform("dof_coc")
  coc = new Vector2();

  @MapUniform("dof_focus")
  focusLength = 0;

  decorate(graph: ShaderGraph) {
    const old = graph.getVertRoot()
    graph
      .setVertexRoot(
        progressiveDof.make()
          .input("positionOld", old)
          .input("cocPoint", this.getPropertyUniform('coc'))
          .input("focusLength", this.getPropertyUniform('focusLength'))
      )
      .updateAutoWorldPositionVary(old);
  }

}