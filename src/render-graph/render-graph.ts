import { RenderGraphNode } from "./render-graph-node";
import { RGNproperty } from "./interface";
import { InputNode } from "./nodes/input-node";
import { RenderNode } from "./nodes/render-node";
import { FilterNode } from "./nodes/filter-node";
import { RenderList } from "../engine/render-list";

type Collection<T> = { [index: string]: T };

export class RenderGraph{
  private inputNodes: Collection<InputNode> = {};
  private nodes: Collection<RenderGraphNode> = {};
  private renderNodes: Collection<RenderNode> = {};

  // input renderlist into renderGraph
  pipeRenderList(node: RenderGraphNode, renderlist: RenderList) {
    if (node instanceof FilterNode ||
      node instanceof RenderNode) {
      node.pipe(renderlist);
    } else {
      throw 'this node not support input renderlist';
    }
  }

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
