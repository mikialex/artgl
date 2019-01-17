import { DAGNode } from "./dag-node";
import { PassDefine } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderPass } from "../pass";

export class PassGraphNode extends DAGNode{
  constructor(graph: RenderGraph, define: PassDefine) {
    super();
    this.name = define.name;
    this.define = define;
    if (define.inputs !== undefined) {
      define.inputs.forEach(textInput => {
        const textureNode = graph.getTextureDependence(textInput);
        if (textureNode === undefined) {
          throw 'render graph build error, texture depend cant found';
        }
        textureNode.connectTo(this);
      })
    }
    if (define.output !== 'screen') {

      const textureNode = graph.getTextureDependence(define.output);
      if (textureNode === undefined) {
        throw 'render graph build error, texture depend cant found';
      }

      this.connectTo(textureNode);
    }

    this.pass = new RenderPass(graph, define);
  }
  readonly name: string;
  readonly define: PassDefine;

  pass: RenderPass;
}