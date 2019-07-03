import { generateUUID } from "../math/uuid";

export class DAGNode {
  uuid:string = generateUUID();
  protected toNode: DAGNode[] = [];
  protected fromNode: DAGNode[] = [];
  protected fulfillList: boolean[] = [];

  public getFromNodeByIndex(index:number) {
    return this.fromNode[index]
  }

  public getToNodeByIndex(index:number) {
    return this.toNode[index]
  }

  public forFromNode(visitor: (node: DAGNode)=>any) {
    this.fromNode.forEach(visitor);
  }

  public forToNode(visitor: (node: DAGNode)=>any) {
    this.toNode.forEach(visitor);
  }

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

  public clearAllTo() {
    this.toNode.forEach(node => {
      this.deConnectTo(node);
    })
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
      node.fulfillList = node.fromNode.map(n => false);
    })
    let preventEndlessCounter = 1;
    const result: DAGNode[] = [];
    function resolveNext(node: DAGNode) {
      result.push(node);
      node.toNode.forEach(n => {
        const selfIndex = n.fromNode.indexOf(node);
        if (selfIndex === -1) {
          throw 'connection error'
        } 
        n.fulfillList[selfIndex] = true;
      })
    }
    while (allDepNodes.length > 0) {
      allDepNodes = allDepNodes.filter(node => {
        if (node.fulfillList.length === 0) {
          resolveNext(node);
          return false
        }
        for (let i = 0; i < node.fulfillList.length; i++) {
          if (!node.fulfillList[i]) {
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

  travserseDFS(visitor: (node: DAGNode) => any) {
    const visited: Set<DAGNode> = new Set();
    function visit(node: DAGNode) {
      if (!visited.has(node)) {
        visited.add(node);
        visitor(node);
        node.fromNode.forEach(n => {
          visit(n);
        });
      }
    }
    visit(this);
  }

  generateAllDependencyList(): DAGNode[] {
    const result: DAGNode[] = [];
    this.travserseDFS((n) => {
      result.push(n);
    })
    return result;
  }
}