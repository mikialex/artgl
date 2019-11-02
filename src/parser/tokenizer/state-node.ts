import { GLSLTokenType } from "./token";
import { Nullable } from "../../type";
import { GLSLTokenizer, GLSLStateType } from "./tokenizer";

export type StateTransitionFunction = (
  tokenizer: GLSLTokenizer
) => StateNode;

export class StateNode{
  constructor(type: GLSLStateType) {
    this.type = type;
  }

  type: GLSLStateType
  transition: StateTransitionFunction

  defineTransition(transition: StateTransitionFunction) {
    this.transition = transition
  }

  transit(
    tokenizer: GLSLTokenizer
  ): StateNode {
    return this.transition(tokenizer)
  }
}