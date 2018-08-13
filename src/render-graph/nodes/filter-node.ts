import { RenderGraphNode } from "../render-node";
import { entityListFilter } from "../interface";

// filter a list
export class FilterNode extends RenderGraphNode {
  constructor(keyName: string) {
    super(keyName);
  }

  setFilter(filter: entityListFilter) {

  }

}
