import { DAGNode } from "./dag-node";
import { PassDefine } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderPass } from "../pass";

export class PassGraphNode extends DAGNode{
  constructor(graph: RenderGraph, define: PassDefine) {
    super();
    this.name = define.name;
    this.define = define;

    this.pass = new RenderPass(graph, define);

    if (define.inputs !== undefined) {
      define.inputs.forEach(inputInfo => {
        const textureNode = graph.getTextureDependence(inputInfo.name);
        if (textureNode === undefined) {
          throw `render graph build error, texture depend ${inputInfo.name} cant found`;
        }
        textureNode.connectTo(this);
      })
    }
    if (define.output !== 'screen') {

      const textureNode = graph.getTextureDependence(define.output);
      if (textureNode === undefined) {
        throw `render graph build error, texture output ${define.output} cant found`;
      }

      this.connectTo(textureNode);
      this.pass.setOutPutTarget(textureNode);
    }

  }
  readonly name: string;
  readonly define: PassDefine;

  pass: RenderPass;
  
}