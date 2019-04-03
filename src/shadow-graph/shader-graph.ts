import { ShaderFunction } from "./shader-function-node";
import { Technique } from "../core/technique";
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage } from "../webgl/attribute";
import { InnerSupportUniform } from "../webgl/uniform/uniform";

export interface ShaderGraphDefine {
  effect,
  transform
}


export class ShaderGraph{
  comileGraph(define: ShaderGraphDefine): Technique {
    return new Technique({
      programConfig: {
        attributes: [
          { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
          { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal, stride: 3 },
          // { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
        ],
        uniformsIncludes: [
          { name: 'MMatrix', mapInner: InnerSupportUniform.MMatrix, },
          { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, }
        ],
        varyings: [
          { name: 'color', type: GLDataType.floatVec3 }
        ],
        vertexShaderString: this.compileVertexSource(define),
        fragmentShaderString: this.compileFragSource(define),
        autoInjectHeader: true,
      }
    });
  }

  compileVertexSource(define: ShaderGraphDefine): string {
    return ""
  }

  compileFragSource(define: ShaderGraphDefine): string {
    return ""
  }

  registShaderFunction(shaderFn: ShaderFunction) {
    
  }
}

const graph = new ShaderGraph();

graph.comileGraph({
  effect: [
    {
      name: "root",
      type: "composeAdd",
      input:["diffuse", "IBL"]
    },
    {
      name: "diffuse",
      type: "diffuse",
      input: ["diffuseTex"]
    },
    {
      name: "IBL",
      type: "envTex",
      input: ["envTex"]
    },
  ],
  transform: [
    {
      name: "root",
      type: "VPtransfrom",
      input: ["VPMatrix"]
    },
  ]
})