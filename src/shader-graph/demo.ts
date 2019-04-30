import { ShaderGraph, ShaderGraphNodeInputType } from "./shader-graph";
import { InnerSupportUniform } from "../webgl/uniform/uniform";

const technique = gammaCorrection(composeAdd(effect, light));

const graph = new ShaderGraph();

graph.setGraph({

  // decalare your fragment shader graph
  // fragment shader graph should have a root node
  // which output is gl_FragColor as the screen fragment output
  effect: [
    {
      output: "gl_FragColor",
      name: "result",
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
      name: "diffuse",
      type: "diffuse_lookup",
      input: {
        diffTex: {
          type: ShaderGraphNodeInputType.textureUniform,
        }
      }
    },
    {
      output: "IBL",
      name: "IBL",
      type: "envTex_cal",
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
      name: "root",
      output: "gl_Position",
      type: "VPtransfrom",
      input: {
        VPMatrix: {
          type: ShaderGraphNodeInputType.innerUniform,
          value: InnerSupportUniform.VPMatrix
        },
        position: {
          type: ShaderGraphNodeInputType.attribute
        }
      }
    },
  ],


})

const techniqueConf = graph.compile();