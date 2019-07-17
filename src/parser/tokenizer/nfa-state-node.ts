import { GLSLTokenType } from "./token";
import { Nullable } from "../../type";

export type StateTransitionFunction = (nextChar: string) => boolean;
export interface StateTransition {
  func: StateTransitionFunction,
  target: StateNode
}

export class StateNode{
  constructor(type: GLSLTokenType) {
    this.type = type;
  }

  type: GLSLTokenType
  transitions: StateTransition[] = [];
  acceptCondition: Nullable<StateTransitionFunction>;

  defineTransitionCondition(condition: StateTransitionFunction, nextNode: StateNode) {
    this.transitions.push({
      func: condition,
      target: nextNode
    })
  }

  transit(nextChar: string): Nullable<StateNode> {
    for (let i = 0; i < this.transitions.length; i++) {
      const tran = this.transitions[i];
      if (tran.func(nextChar)) {
        return tran.target;
      }
    }
    return null;
  }
}