import { RenderGraphNode } from "./render-node";

export interface Pipeable{

}

export class RenderGraph{
  private pipelines = [];
  private inputNode: RenderGraphNode;

  updateRenderNodeDenpendency() {
    
  }

  setInputNode(node: RenderGraphNode) {
    this.inputNode = node;
  }

  snapShot() {
    
  }
}
