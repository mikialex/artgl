import { RenderGraphNode } from "./render-node";
import { RGNproperty } from "./interface";

export interface Pipeable{

}

// export class PipeLine{
//   constructor() {
    
//   }

//   node: RenderGraphNode;
// }

export class RenderGraph{
  private pipelines = [];
  private inputNodes: RenderGraphNode[];
  private nodeEvalList: RenderGraphNode[] = [];

  private updateRenderNodeDenpendency() {

  }

  getNodeProperty(propertyDescriptor: RGNproperty) {
    
  }

  setInputNode(node: RenderGraphNode) {
    this.inputNode = node;
  }

  snapShot() {
    
  }
}
