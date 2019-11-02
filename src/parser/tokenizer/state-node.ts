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
  constructor(type: GLSLStateType, emitType?: GLSLTokenType) {
    this.type = type;
    if (emitType !== undefined) {
      this.emitType = emitType;
    }
  }

  type: GLSLStateType
  transitions: StateTransition[] = [];

  emitType: Nullable<GLSLTokenType> = null;

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