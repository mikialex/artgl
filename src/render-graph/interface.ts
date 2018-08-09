import { EntityList } from "./entity-list";
import { RenderGraphNode } from "./render-node";


// get a property on rgn
export interface RGNproperty{
  node: RenderGraphNode,
  key: string
}

// a entity operation function may rely some value outside
// the value should provided by rgn's some property
export type entityListFilterFunc = (item, params: any) => boolean;
export interface entityListFilter {
  func: entityListFilterFunc;
  dependency: RGNproperty[];
}
export type entityListOperationFunc = (item, params: any) => any;
export interface entityListOperator {
  func: entityListFilterFunc;
  dependency: RGNproperty[];
}

// describe a rendernode output, which can be
// get a real list by excute it, we not generate new list
// because of memory over allocation
export interface RGNListOutPut {
  list: EntityList;
  filters: entityListFilter[];
}

export interface RGNDependency {
  node: RenderGraphNode;
  
}

