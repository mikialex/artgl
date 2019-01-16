
export class DAGNode{
  private toNode: DAGNode[] = [];
  private fromNode: DAGNode[] = [];
  private fullfillList: boolean[] = [];

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

  generateDependencyOrderList(): DAGNode[] {
    let allDepNodes = this.generateAllDependencyList();
    allDepNodes.forEach(node => {
      node.fullfillList = node.fromNode.map(n => false);
    })
    let preventEndlessCounter = 1;
    const result = [];
    function resolveNext(node: DAGNode) {
      result.push(node);
      node.toNode.forEach(n => {
        const selfIndex = n.fromNode.indexOf(node);
        if (selfIndex === -1) {
          throw 'comection error'
        } 
        n.fullfillList[selfIndex] = true;
      })
    }
    while (allDepNodes.length > 0) {
      allDepNodes = allDepNodes.filter(node => {
        if (node.fullfillList.length === 0) {
          resolveNext(node);
          return false
        }
        for (let i = 0; i < node.fullfillList.length; i++) {
          if (!node.fullfillList[i]) {
            return true;
          }
        }
        resolveNext(node);
        return false;
      });
      preventEndlessCounter++;
      if (preventEndlessCounter > 10000) {
        throw 'generateDependencyOrderList failed';
      }
    }
    return result;
  }

  // FIX ME, this traverse is a joke
  travserseDFS(visitor: (node: DAGNode) => any) {
    function visit(node: DAGNode) {
      visitor(node);
      node.fromNode.forEach(n => {
        visit(n);
      });
    }
    visit(this);
  }

  generateAllDependencyList(): DAGNode[] {
    const result = [];
    this.travserseDFS((n) => {
      result.push(n);
    })
    return result;
  }
}