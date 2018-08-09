import { EntityList } from "./entity-list";
import { RGNListOutPut, RGNDependency, entityListFilter } from "./interface";

let gid = 0;
// implement node connect logic
export class RenderGraphNode {
  constructor() {
    this.id = gid++;
  }
  id: number;

  dependency: RGNDependency[];

  makeDependency(node: RenderGraphNode) {
    
  }

  getResult(): RGNListOutPut {
    return {} as any;
  }

  getNetResult(): EntityList {
    return {} as any;
  }

}


// transform a list
export interface TransformNodeConfig {
  transformFunc: (any) => any;
}
export class TransformNode extends RenderGraphNode{
  constructor(config: TransformNodeConfig) {
    super();
  }
}

// filter a list
export class FilterNode extends RenderGraphNode {
  constructor() {
    super();
  }

  setFilter(filter: entityListFilter) {
    
  }

  getList() {
    
  }

}


export class RenderNode extends RenderGraphNode {

}