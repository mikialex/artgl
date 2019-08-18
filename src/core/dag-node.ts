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

    const resolved: Set<DAGNode> = new Set();
    while (resolved.size != allDepNodes.size) {
        allDepNodes.forEach(node => {
          if (resolved.has(node)) {
            return;
          }
          if (node.fulfillList.size === 0) {
            resolved.add(node);
            resolveNext(node);
          }
      });
    }
    return result;
  }

  traverseDFS(visitor: (node: DAGNode) => void) {
    const visited: Set<DAGNode> = new Set();
    function visit(node: DAGNode) {
      if (!visited.has(node)) {
        visited.add(node);
        visitor(node);
        node.fromNodes.forEach(n => {
          visit(n);
        });
        visited.delete(node);
      } else {
        throw 'node graph contains cycles.';
      }
    }
    visit(this);
  }

  generateAllDependencyList(): Set<DAGNode>{
    const result: Set<DAGNode> = new Set();
    this.traverseDFS((n) => {
      result.add(n);
    })
    return result;
  }
}