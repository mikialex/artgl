import { RenderGraphNode } from "./render-node";
import { RGNproperty } from "./interface";
import { InputNode } from "./nodes/input-node";
import { RenderNode } from "./nodes/render-node";

type Collection<T> = { [index: string]: T };

export class RenderGraph{
  private inputNodes: Collection<InputNode> = {};
  private nodes: Collection<RenderGraphNode> = {};
  private renderNodes: Collection<RenderNode> = {};

  getNodeProperty(propertyDescriptor: RGNproperty) {
    
  }

  addNode(node: RenderGraphNode) {
    this.nodes[node.keyName] = node;
  }

  addInputNode(node: InputNode) {
    this.inputNodes[node.keyName] = node;
  }

  snapShot() {
    
  }
}
