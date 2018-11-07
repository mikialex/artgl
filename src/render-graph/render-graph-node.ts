import { EntityList } from "./entity-list";
import { RenderGraph } from "./render-graph";


let gid = 0;
// implement node connect logic
export class RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    this.id = gid++;
    this.keyName = keyName;
    this.graph = graph;
    this.graph.addInputNode
  }
  id: number;
  keyName: string;
  isValid: boolean = false;
  private isResolved: boolean = true;
  graph: RenderGraph;

  // this node depends whats nodes
  dependency: RenderGraphNode[];

  checkValidation() {
    this.isValid = true;
    return this.isValid;
  }

  defineDependency(node: RenderGraphNode) {
    this.dependency.push(node);
  }
  removeDependency(node: RenderGraphNode) {
    const index = this.dependency.indexOf(node);
    if (index !== -1) {
      this.dependency.splice(index, 1);
    }
  }

  cachedEntityList: EntityList;
  entityListNeedUpdate: boolean = true;
  getEntityList(): EntityList {
    if (this.entityListNeedUpdate) {
    }
    return this.cachedEntityList;
  }

  updateEntityList() {
    let dependNodes = [];
    const queue = [];

    function findDependNodes(node){
      node.dependency.forEach(n => {
        if (dependNodes.indexOf(n) === -1) {
          dependNodes.push(n);
        }
        n.isResolved = false;
        findDependNodes(n);
      });
    }
    findDependNodes(this);

    function checkAllDepResolved(node) {
      let resolved = true;
      node.dependency.forEach(n => {
        if (n.isResolved === false) {
          resolved = false;
        }
      })
      return resolved;
    }
    let preventInfinit = 0;
    while (dependNodes.length !== 0 ) {
      preventInfinit++;
      if (preventInfinit < 1000) {
        throw 'cant update entitylist';
      }
      dependNodes = dependNodes.filter((n: RenderGraphNode) => {
        if (checkAllDepResolved(n)) {
          queue.push(n);
          n.isResolved = true;
          return false;
        } else {
          return true;
        }
      })
    }


  }

}
