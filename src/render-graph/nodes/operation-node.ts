import { RenderGraphNode } from "../render-node";
import { RenderGraph } from "../render-graph";

// transform a list
export interface OperationNodeConfig {
  transformFunc: (any) => any;
}
export class OperationNode extends RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    super(keyName, graph);
  }

  operationConfig: OperationNodeConfig

  setConfig(config: OperationNodeConfig) {
    
  }

  
}
