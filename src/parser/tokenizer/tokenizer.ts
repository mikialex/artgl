import { StateNode } from "./nfa-state-node";
import { GLSLToken } from "./token";


export enum GLSLStateType {
  NORMAL = 'normal',
  TOKEN = 'token',
  BLOCK_COMMENT = 'block comment',
  LINE_COMMENT = 'line comment',
  PREPROCESSOR = 'preprocessor',
  OPERATOR = 'operator',
  INTEGER = 'integer',
  FLOAT = 'float',
  IDENT = 'ident',
  BUILTIN = 'inner func',
  KEYWORD = 'keyword',
  WHITESPACE = 'space',
  EOF = 'eof',
  HEX = 'hex number',
}

const NORMAL = new StateNode(GLSLStateType.NORMAL)
const TOKEN = new StateNode(GLSLStateType.TOKEN)
const OPERATOR = new StateNode(GLSLStateType.OPERATOR)
const INTEGER = new StateNode(GLSLStateType.INTEGER)
const WHITESPACE = new StateNode(GLSLStateType.WHITESPACE)
const PREPROCESSOR = new StateNode(GLSLStateType.PREPROCESSOR)
const LINE_COMMENT = new StateNode(GLSLStateType.LINE_COMMENT)
const BLOCK_COMMENT = new StateNode(GLSLStateType.BLOCK_COMMENT)
const KEYWORD = new StateNode(GLSLStateType.KEYWORD)

NORMAL.defineTransition(tokenizer => {
  const isNumber = /\d/.test(tokenizer.lastPeekingChar)
  const isOperator = /[^\w_]/.test(tokenizer.lastPeekingChar)
  return !isNumber && !isOperator;
}, TOKEN);
NORMAL.defineTransition(tokenizer => /[^\w_]/.test(tokenizer.lastPeekingChar), OPERATOR);
NORMAL.defineTransition(tokenizer => /\d/.test(tokenizer.lastPeekingChar), INTEGER);
NORMAL.defineTransition(tokenizer => /\s/.test(tokenizer.lastPeekingChar), WHITESPACE);
NORMAL.defineTransition(tokenizer => tokenizer.lastPeekingChar === '#', PREPROCESSOR);
NORMAL.defineTransition(tokenizer => tokenizer.allPeeking === '//', LINE_COMMENT);
NORMAL.defineTransition(tokenizer => tokenizer.allPeeking === '/*', BLOCK_COMMENT);

// TOKEN.defineTransition(tokenizer => {
//   if (/[^\d\w_]/.test(this.currentCharactor)) {
    
//   }
// }), KEYWORD);


export class GLSLTokenizer {
  tokens: [];
  input: string;
  peeking: number; // peek forward position
  hasRead: number; // char before read is All tokenized

  currentLine: number;
  currentCol: number;
  currentMode: GLSLStateType;

  get lastPeekingChar() {
    return this.input[this.peeking];
  }

  get allPeeking() {
    return this.input.slice(this.hasRead, this.peeking);
  }

  reset() {
    this.tokens = [];
    this.input = "";
    this.peeking = 0;
    this.hasRead = 0;

    this.currentLine = 0;
    this.currentCol = 0;
    this.currentMode = GLSLStateType.NORMAL;
  }

  peek() {
    this.peeking++;
  }

  tokenize(input: string): GLSLToken[] {
    this.reset();
    this.input = input;


    return this.tokens.slice();
  }
}