import { RenderGraphNode } from "../render-graph-node";
import { EntityList } from "../entity-list";
import { RenderGraph } from "../render-graph";

export class InputNode extends RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    super(keyName, graph);
  }

  private input: EntityList;
  setInput(input: EntityList) {
    this.input = input;
  }
}
