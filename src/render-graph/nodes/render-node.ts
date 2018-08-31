import { RenderGraphNode } from "../render-node";
import { RenderGraph } from "../render-graph";
import { ARTEngine } from "../../renderer/render-engine";

export class RenderNode extends RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    super(keyName, graph);
  }

  renderer: ARTEngine;
}