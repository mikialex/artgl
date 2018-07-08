import { Material, standradMeshAttributeLayout } from "../core/material";
import { GLDataType } from "../webgl/shader-util";

const TestMaterialUniforms = [{
  name: 'color', type: GLDataType.float
}]

export class TestMaterial extends Material{
  constructor() {
    super({
      attributeLayout: standradMeshAttributeLayout,
      uniforms: TestMaterialUniforms
    });
  }
}