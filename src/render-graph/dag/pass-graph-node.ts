import { DAGNode } from "./dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderPass } from "../pass";

export class PassGraphNode extends DAGNode{
  constructor(graph: RenderGraph, define: PassDefine) {
    super();
    this.name = define.name;
    this.define = define;

    this.pass = new RenderPass(graph, define);

    if (define.inputs !== undefined) {
      define.inputs().forEach(inputInfo => {
        const renderTargetNode = graph.getTextureDependence(inputInfo.name);
        if (renderTargetNode === undefined) {
          throw `render graph build error, texture depend ${inputInfo.name} cant found`;
        }
        renderTargetNode.connectTo(this);
      })
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
  readonly name: string;
  readonly define: PassDefine;

  checkUpdateDependNode() {
    
  }

  private inputs: () => PassInputMapInfo[]
  pass: RenderPass;
  
}