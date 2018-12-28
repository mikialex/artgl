export class DAGNode{
  private toNode: DAGNode[];
  private fromNode: DAGNode[];

  public connectTo(node: DAGNode) {
    this.toNode.push(node);
  }

  public deConnectTo(node: DAGNode) {
    
  }

  traverse(func: Function) {
    
  }
}