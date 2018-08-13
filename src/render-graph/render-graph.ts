import { RenderGraphNode } from "./render-node";
import { RGNproperty } from "./interface";
import { InputNode } from "./nodes/input-node";
import { RenderNode } from "./nodes/render-node";


export class RenderGraph{
  private inputNodes: InputNode[];
  private nodes: RenderGraphNode[];
  private renderNodes: RenderNode[];
  private nodeEvalList: RenderGraphNode[] = [];


  getNodeProperty(propertyDescriptor: RGNproperty) {
    
  }

  addNode(node: InputNode) {
    this.inputNodes.push(node);
  }

  snapShot() {
    
  }
}
