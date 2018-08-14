import { RenderGraphNode } from "../render-node";
import { RenderGraph } from "../render-graph";

export class RenderNode extends RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    super(keyName, graph);
  }
}