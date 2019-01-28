import { DAGNode } from "./dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderPass } from "../pass";

export class PassGraphNode extends DAGNode{
  constructor(graph: RenderGraph, define: PassDefine) {
    super();
    this.graph = graph;
    this.name = define.name;
    this.define = define;

    this.pass = new RenderPass(graph, define);

    if (define.inputs !== undefined) {
      this.inputGetter = define.inputs;
      this.updateDependNode();
    }

    if (define.output !== 'screen') {
      const renderTargetNode = graph.getTextureDependence(define.output);
      if (renderTargetNode === undefined) {
        throw `render graph build error, texture output ${define.output} cant found`;
      }

      this.connectTo(renderTargetNode);
      this.pass.setOutPutTarget(renderTargetNode);
    }

  }
  readonly graph: RenderGraph;
  readonly inputGetter: () => PassInputMapInfo
  private inputs: PassInputMapInfo
  readonly name: string;
  readonly define: PassDefine;

  updateDependNode() {
    this.inputs = this.inputGetter();
    Object.keys(this.inputs).forEach(inputKey => {
      const renderTargetNode = this.graph.getTextureDependence(inputKey);
      if (renderTargetNode === undefined) {
        throw `render graph build error, texture depend ${inputKey} cant found`;
      }
      renderTargetNode.connectTo(this);
    })
    this.pass.updateInputTargets(this.inputs);
  }

  pass: RenderPass;
  
}