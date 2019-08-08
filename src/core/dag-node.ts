import { generateUUID } from "../math/uuid";

export class DAGNode {
  uuid: string = generateUUID();
  toNodes: Set<DAGNode> = new Set();
  fromNodes: Set<DAGNode> = new Set();
  protected fulfillList: Map<string, boolean> = new Map();

  connectTo(node: DAGNode) {
    this.toNodes.add(node);
    node._addFromRef(this);
  }

  disconnectTo(node: DAGNode) {
    this.toNodes.delete(node);
    node._removeFromRef(this);
  }

  clearAllTo() {
    this.toNodes.forEach((node) => {
      node._removeFromRef(this)
    })
    this.toNodes.clear();
  }

  clearAllFrom() {
    this.fromNodes.forEach((node) => {
      node._removeToRef(this);
    })
    this.fromNodes.clear();
  }

  _addFromRef(node: DAGNode) {
    this.fromNodes.add(node);
  }

  _removeFromRef(node: DAGNode) {
    this.fromNodes.delete(node);
  }

  _addToRef(node: DAGNode) {
    this.toNodes.add(node);
  }

  _removeToRef(node: DAGNode) {
    this.toNodes.delete(node);
  }

  // TODO this should be optimized
  generateDependencyOrderList(): DAGNode[] {
    // get all possible depend node, and reset fulfill list
    let allDepNodes = this.generateAllDependencyList();
    allDepNodes.forEach(node => {
      node.fulfillList.clear();
      node.fromNodes.forEach((n) => {
        node.fulfillList.set(n.uuid, false);
      })
    })

    let preventEndlessCounter = 1;
    const result: DAGNode[] = [];

    function resolveNext(node: DAGNode) {
      result.push(node);
      node.toNodes.forEach((n) => {
        n.fulfillList.delete(node.uuid);
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
        node.fromNodes.forEach(n => {
          visit(n);
        });
      }
    }
    visit(this);
  }

  traverseDFS2(visitor: (node: DAGNode) => any) {
    const visited: Map<DAGNode, number> = new Map();
    function visit(node: DAGNode, depth: number) {
      if (!visited.has(node)) {
        visited.set(node, depth);
        visitor(node);
        node.fromNodes.forEach(n => {
          visit(n, depth + 1);
        });
      } else {
        if (visited.get(node) < depth) {
          throw 'graph contains cycle.'
        }
      }
    }
    visit(this, 0);
  }


  generateAllDependencyList(): DAGNode[] {
    const result: DAGNode[] = [];
    this.traverseDFS((n) => {
      result.push(n);
    })
    return result;
  }
}