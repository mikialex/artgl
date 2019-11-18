import {
  BaseEffectShading, ShaderFunction, ShadingComponent,
  ShaderGraph, Vector2, ShadingUniform
} from "@artgl/core";


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


@ShadingComponent()
export class TestS extends BaseEffectShading<TestS>{
  decorate(graph: ShaderGraph) { }

  coc = new Vector2();

}


@ShadingComponent()
export class ProgressiveDof extends BaseEffectShading<ProgressiveDof> {
  
  @ShadingUniform("dof_focus")
  focusLength = 0;


  @ShadingUniform("dof_coc")
  coc = new Vector2();

  updateSample() {
    this.coc = new Vector2(Math.random() - 0.5, Math.random() - 0.5)
      .normalize().multiplyScalar(this.blurRadius)// todo, fix change watch
  }

  blurRadius = 0.005

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