import { GLSLTokenType } from "./token";
import { Nullable } from "../../type";
import { GLSLTokenizer, GLSLStateType } from "./tokenizer";

export type StateTransitionFunction = (
  tokenizer: GLSLTokenizer
) => boolean;

export interface StateTransition {
  func: StateTransitionFunction,
  target: StateNode
}

export class StateNode{
  constructor(type: GLSLStateType) {
    this.type = type;
  }

  type: GLSLStateType
  transitions: StateTransition[] = [];
  acceptCondition: Nullable<StateTransitionFunction>;

  defineTransition(condition: StateTransitionFunction, nextNode: StateNode) {
    this.transitions.push({
      func: condition,
      target: nextNode
    })
  }

  transit(
    tokenizer: GLSLTokenizer
  ): StateNode {
    for (let i = 0; i < this.transitions.length; i++) {
      const tran = this.transitions[i];
      if (tran.func(tokenizer)) {
        return tran.target;
      }
    }
  }
}