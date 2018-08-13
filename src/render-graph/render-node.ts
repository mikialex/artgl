import { EntityList } from "./entity-list";


let gid = 0;
// implement node connect logic
export class RenderGraphNode {
  constructor(keyName: string) {
    this.id = gid++;
    this.keyName = keyName;
  }
  id: number;
  keyName: string;
  isValid: boolean = false;

  // this node depends whats nodes
  dependency: RenderGraphNode[];

  checkValidation() {
    this.isValid = true;
    return this.isValid;
  }

  makeDependency(node: RenderGraphNode) {
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
      
    } else {
      return this.cachedEntityList
    }
  }

}
