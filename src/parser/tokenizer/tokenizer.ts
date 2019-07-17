import { StateNode } from "./nfa-state-node";
import { GLSLTokenType, GLSLToken } from "./token";

export class GLSLTokenizer {
  constructor() {
    const normal = new StateNode(GLSLTokenType.NORMAL);
    const token = new StateNode(GLSLTokenType.TOKEN);
    const blockComment = new StateNode(GLSLTokenType.BLOCK_COMMENT);
    const lineComment = new StateNode(GLSLTokenType.LINE_COMMENT);
    const preprocessor = new StateNode(GLSLTokenType.PREPROCESSOR);
    const operator = new StateNode(GLSLTokenType.OPERATOR);
    const integer = new StateNode(GLSLTokenType.INTEGER);
    const float = new StateNode(GLSLTokenType.FLOAT);
    const ident = new StateNode(GLSLTokenType.IDENT);
  }

  nodes: Map<GLSLTokenType, StateNode> = new Map();
  startNode: StateNode
  currentNode: StateNode

  parsedToken: GLSLToken[] = [];

  reset() {

  }

  tokenize(input: string): GLSLToken[] {
    return this.parsedToken;
  }

  read(char: string) {
    const next = this.currentNode.transit(char);
    if (next === null) {
      if (next.acceptCondition !== null && next.acceptCondition(char)) {
        this.emitToken(this.currentNode);
        this.currentNode = this.startNode;
      }
    } else {
      this.currentNode = next;
    }
  }

  emitToken(node: StateNode) {
    
  }
}
