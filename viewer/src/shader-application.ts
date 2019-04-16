import { ShaderGraph, ShaderGraphNodeInputType } from '../../src/shader-graph/shader-graph';
import { InnerSupportUniform } from '../../src/webgl/uniform/uniform';
import { ARTEngine } from '../../src/artgl';
import { GLDataType } from '../../src/webgl/shader-util';

export class ShaderApplication {

  canvas: HTMLCanvasElement;
  graph: ShaderGraph = new ShaderGraph();

  engine: ARTEngine;


  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new ARTEngine(canvas);
    this.graph.setGraph({

      // decalare your fragment shader graph
      // fragment shader graph should have a root node
      // which output is gl_FragColor as the screen fragment output
      effect: [
        {
          output: "gl_FragColor",
          name: "result",
          type: "composeAddVec4",
          input: {
            diffuse: {
              type: ShaderGraphNodeInputType.commenUniform,
              dataType: GLDataType.float // TODO inner uniform may not need datatype define
              // type: ShaderGraphNodeInputType.shaderFunctionNode,
            },
            IBL: {
              type: ShaderGraphNodeInputType.commenUniform,
              dataType: GLDataType.float
              // type: ShaderGraphNodeInputType.shaderFunctionNode,
            },
          }
        },
        // {
        //   output: "diffuse",
        //   name: "diffuse",
        //   type: "diffuse_lookup",
        //   input: {
        //     diffTex: {
        //       type: ShaderGraphNodeInputType.textureUniform,
        //     }
        //   }
        // },
        // {
        //   output: "IBL",
        //   name: "IBL",
        //   type: "envTex_cal",
        //   input: {
        //     envTex: {
        //       type: ShaderGraphNodeInputType.textureUniform,
        //     }
        //   }
        // },
      ],
    
      // declare your vertex shader graph
      // like frag, we export the graph root as gl_Position
      transform: [
        {
          name: "root",
          output: "gl_Position",
          type: "VPtransfrom",
          input: {
            VPMatrix: {
              type: ShaderGraphNodeInputType.commenUniform,
              dataType: GLDataType.floatVec3,
              isInnerValue: true,
              value: InnerSupportUniform.VPMatrix
            },
            position: {
              type: ShaderGraphNodeInputType.attribute,
              dataType: GLDataType.floatVec3
            }
          }
        },
      ],
    
    
    })
  }

  uninit() {
    this.canvas = null;
    this.engine = null;
  }


}


export let ShaderApp: ShaderApplication = new ShaderApplication();