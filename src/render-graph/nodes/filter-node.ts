import { RenderGraphNode } from "../render-graph-node";
import { entityListFilter } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderList } from "../../renderer/render-list";

// filter a list
export class FilterNode extends RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    super(keyName, graph);
  }

  setFilter(filter: entityListFilter) {

  }

  pipe(render: RenderList) {
    
  }

}
