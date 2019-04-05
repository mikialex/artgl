import { ShaderFunction } from "./shader-function";
import { Technique } from "../core/technique";
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage } from "../webgl/attribute";
import { InnerSupportUniform } from "../webgl/uniform/uniform";

export interface ShaderGraphDefine {
  effect,
  transform,
  uniform,
  attribute,

}


export class ShaderGraph {

  setGraph(define: ShaderGraphDefine): void {

  }

  compile(): Technique {
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

export enum ShaderGraphNodeInputType{
  innerUniform,
  textureUniform,
  shaderFunctionNode,
  Attribute
}

graph.setGraph({

  // decalare your fragment shader graph
  // fragment shader graph should have a root node
  // which output is gl_FragColor as the screen fragment output
  effect: [
    {
      output: "gl_FragColor",
      type: "composeAdd",
      input: {
        diffuse: {
          type: ShaderGraphNodeInputType.shaderFunctionNode,
        },
        IBL: {
          type: ShaderGraphNodeInputType.shaderFunctionNode,
        },
      }
    },
    {
      output: "diffuse",
      type: "diffuse",
      input: {
        envTex: {
          type: ShaderGraphNodeInputType.textureUniform,
        }
      }
    },
    {
      output: "IBL",
      type: "envTex",
      input: {
        envTex: {
          type: ShaderGraphNodeInputType.textureUniform,
        }
      }
    },
  ],

  // declare your vertex shader graph
  // like frag, we export the graph root as gl_Position
  transform: [
    {
      output: "gl_Position",
      type: "VPtransfrom",
      input: {
        VPMatrix: {
          type: ShaderGraphNodeInputType.innerUniform,
          innerValue: InnerSupportUniform.VPMatrix
        },
        position: {
          type:ShaderGraphNodeInputType.Attribute
        }
      }
    },
  ],

  // declare the sourceing you want used in your shader
  uniform: {
    VPMatrix: {
      type: 'inner',
      innerValue: InnerSupportUniform.VPMatrix
    }
  },
  attribute: [

  ]
})

const technique = graph.compile();