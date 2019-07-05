import { ShaderGraph } from "../shader-graph";
import { ShaderFunction } from "../shader-function";
import { GLDataType } from "../../webgl/shader-util";
import { ShaderAttributeInputNode, ShaderCommonUniformInputNode } from "../shader-node";
import { AttributeDescriptor } from "../../webgl/attribute";

const graph = new ShaderGraph();
const composeAddVec4 = new ShaderFunction({
  source: `
  vec4 composeAddVec4(vec4 sourceA, vec4 sourceB){
    return sourceA + sourceB;
  }`})

function makeAttribute(att: AttributeDescriptor) {
  return new ShaderAttributeInputNode(att);
}

function makeUniform(name: string, type: GLDataType) {
  return new ShaderCommonUniformInputNode({
   name, type
  })
}

const diffuse = new ShaderFunction({
  source: `
  vec4 diffuse(vec3 diffuseColor){
    return vec4(diffuseColor, 1.0);
  }`
})

// const realTechnique = composeAddVec4.make()
//   .input("sourceA", lightResult)
//   .link("sourceB", baseTechnique)
//   .compile()


test('shader graph set fragment root', () => {
  graph.setVertexRoot(
    composeAddVec4.make().input(
      "sourceA", diffuse.make().input(
        "diffuseColor", makeUniform("u_color1", GLDataType.floatVec3)
      )
    ).input(
      "sourceB", diffuse.make().input(
        "diffuseColor", makeUniform("u_color2", GLDataType.floatVec3)
      ))
  ).setVary(
    "v_normal", composeAddVec4.make()
  ).setFragmentRoot(
    composeAddVec4.make().input(
      "sourceA", diffuse.make().input(
        "diffuseColor", makeUniform("u_color1",GLDataType.floatVec3)
      )
    ).input(
      "sourceB",
      diffuse.make().input(
        "diffuseColor", makeUniform("u_color2",GLDataType.floatVec3)
      )).input(
        "diffuseColor", graph.getVary("v_normal")
      )
  )
  // expect(v.z).toBe(4);
});
