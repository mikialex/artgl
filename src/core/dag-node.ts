import { generateUUID } from "../math/uuid";

export class DAGNode {
  uuid: string = generateUUID();
  toNodeMap: Map<string, DAGNode> = new Map();
  fromNodeMap: Map<string, DAGNode> = new Map();
  protected fulfillList: Map<string, boolean> = new Map();

  getFromNode(key: string) {
    return this.fromNodeMap.get(key);
  }

  getToNode(key: string) {
    return this.toNodeMap.get(key);
  }

  connectTo(key: string, node: DAGNode) {
    this.toNodeMap.set(key, node);
    node._addFromRef(key, this);
  }

  disconnectTo(key: string, node: DAGNode) {
    this.toNodeMap.delete(key);
    node._removeFromRef(key);
  }

  clearAllTo() {
    this.toNodeMap.forEach((node, key) => {
      this.disconnectTo(key, node);
    })
  }

  clearAllFrom() {
    this.fromNodeMap.forEach((node, key) => {
      node.disconnectTo(key, this);
    })
  }

  _addFromRef(key: string, node: DAGNode) {
    this.fromNodeMap.set(key, node);
  }

  _removeFromRef(key: string) {
    this.fromNodeMap.delete(key);
  }

  // TODO this should be optimized
  generateDependencyOrderList(): DAGNode[] {
    // get all possible depend node, and reset fulfill list
    let allDepNodes = this.generateAllDependencyList();
    allDepNodes.forEach(node => {
      node.fulfillList.clear();
      node.toNodeMap.forEach((node, key) => {
        node.fulfillList.set(key, false);
      })
    })

    let preventEndlessCounter = 1;
    const result: DAGNode[] = [];

    function resolveNext(node: DAGNode) {
      result.push(node);
      node.toNodeMap.forEach((n, key) => {
        n.fulfillList.delete(key);
      })
    }

    while (allDepNodes.length > 0) {
      allDepNodes = allDepNodes.filter(node => {
        if (node.fulfillList.size === 0) {
          resolveNext(node);
          return false
        }
        return true;
      });

      preventEndlessCounter++;
      if (preventEndlessCounter > 10000) {
        throw 'generateDependencyOrderList failed, graph may contains loop.';
      }

    }
    return result;
  }

  traverseDFS(visitor: (node: DAGNode) => any) {
    const visited: Set<DAGNode> = new Set();
    function visit(node: DAGNode) {
      if (!visited.has(node)) {
        visited.add(node);
        visitor(node);
        node.fromNodeMap.forEach(n => {
          visit(n);
        });
      }
    }
    visit(this);
  }

  generateAllDependencyList(): DAGNode[] {
    const result: DAGNode[] = [];
    this.traverseDFS((n) => {
      result.push(n);
    })
    return result;
  }
}