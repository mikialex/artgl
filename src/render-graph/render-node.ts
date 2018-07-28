

// export interface RenderGraphNodeConfig{
//   outputs: {
//     [index:string]: 
//   }
// }

let gid = 0;
// implement node connect logic
export class RenderGraphNode {
  constructor() {
    this.id = gid++;
  }
  id: number;


}

interface OperationDiscriptor{
  oper
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
export interface FilterNodeConfig{
  filterFunc: (any) => boolean;
}
export class FilterNode extends RenderGraphNode {
  constructor(config: FilterNodeConfig) {
    super();
  }

  filteredResult

  filteritemResult

}


export class RenderNode extends RenderGraphNode {

}