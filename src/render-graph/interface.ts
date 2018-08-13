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
  func: entityListOperationFunc;
  dependency: RGNproperty[];
}

export type entityListTransfomer = entityListOperator | entityListFilter;


