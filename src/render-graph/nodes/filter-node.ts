import { RenderGraphNode } from "../render-node";
import { entityListFilter } from "../interface";
import { RenderGraph } from "../render-graph";

// filter a list
export class FilterNode extends RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    super(keyName, graph);
  }

  setFilter(filter: entityListFilter) {

  }

}
