import { RenderGraphNode } from "../render-node";

// transform a list
export interface OperationNodeConfig {
  transformFunc: (any) => any;
}
export class OperationNode extends RenderGraphNode {
  constructor(keyName: string, config: OperationNodeConfig) {
    super(keyName);
  }

  
}
