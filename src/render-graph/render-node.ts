

let gid = 0;
// implement node connect logic
export class RenderGraphNode {
  constructor() {
    this.id = gid++;
  }
  id;
}


export interface TransformNodeConfig {
  transformFunc: (any) => any
}
// to transform entitiy list
export class TransformNode extends RenderGraphNode{
  constructor(config: TransformNodeConfig) {
    super();
  }
}


export class RenderNode extends RenderGraphNode {

}