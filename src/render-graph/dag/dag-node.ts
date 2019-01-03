export class DAGNode{
  private toNode: DAGNode[];
  private fromNode: DAGNode[];

  public connectTo(node: DAGNode) {
    this.toNode.push(node);
    node._addFromRef(this);
  }

  public _addFromRef(node: DAGNode) {
    this.fromNode.push(node);
  }

  public deConnectTo(node: DAGNode) {
    const index = this.toNode.indexOf(node);
    if (index === undefined) {
      throw 'node not found';
    }
    this.toNode.splice(index, 1);
    node._removeFromRef(this);
  }

  public _removeFromRef(node: DAGNode) {
    const index = this.fromNode.indexOf(node);
    if (index === undefined) {
      throw 'node not found';
    }
    this.fromNode.splice(index, 1);
  }

  static generateDependencyOrderList(nodeStart: DAGNode): DAGNode[] {
    return [nodeStart];
  }
}