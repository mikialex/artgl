import { DAGNode } from "../render-graph/dag/dag-node";

interface Token{
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number,
  value: string,
  type: TokenType
}

enum TokenType{
  NORMAL = 'normal',      // <-- never emitted
  TOKEN = 'token',         // <-- never emitted
  BLOCK_COMMENT= 'block comment',
  LINE_COMMENT = 'line comment',
  PREPROCESSOR = 'preporcessor',
  OPERATOR = 'operator',
  INTEGER = 'integer',
  FLOAT = 'float',
  IDENT = 'ident',
  BUILTIN = 'inner func',
  KEYWORD = 'keyworld',
  WHITESPACE = 'space',
  EOF = 'eof',
  HEX = 'hex number',
}

type StateMoveFunction =  (nextChar: string) => boolean; 

class StateNode extends DAGNode {
  defineMoveCondition(condition: StateMoveFunction, nextNode: StateNode) {
    
  }
}

class GLSLTokenizer{
  tokens: [];
  input: string;
  peek: number;
  read: number;

  currentLine: number;
  currentCol: number;
  currentMode: TokenType;

  reset() {
    this.tokens = [];
    this.input = "";
    this.peek = 0;
    this.read = 0;
  
    this.currentLine= 0;
    this.currentCol = 0;
    this.currentMode = TokenType.NORMAL;
  }

  readToken() {

  }

  tokenize(input: string): Token[] {
    this.reset();
    this.input = input;
    return this.tokens.slice();
  }
}