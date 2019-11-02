import { StateNode } from "./state-node";
import { GLSLToken, GLSLTokenType } from "./token";


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

function isKeyWord(str: string) {
  return false;
}

const NORMAL = new StateNode(GLSLStateType.NORMAL)
const TOKEN = new StateNode(GLSLStateType.TOKEN)
const OPERATOR = new StateNode(GLSLStateType.OPERATOR, GLSLTokenType.OPERATOR)
const INTEGER = new StateNode(GLSLStateType.INTEGER, GLSLTokenType.INTEGER)
const WHITESPACE = new StateNode(GLSLStateType.WHITESPACE, GLSLTokenType.WHITESPACE)
const PREPROCESSOR = new StateNode(GLSLStateType.PREPROCESSOR, GLSLTokenType.PREPROCESSOR)
const LINE_COMMENT = new StateNode(GLSLStateType.LINE_COMMENT, GLSLTokenType.LINE_COMMENT)
const BLOCK_COMMENT = new StateNode(GLSLStateType.BLOCK_COMMENT, GLSLTokenType.BLOCK_COMMENT)
const KEYWORD = new StateNode(GLSLStateType.KEYWORD, GLSLTokenType.KEYWORD)
const IDENT = new StateNode(GLSLStateType.IDENT, GLSLTokenType.IDENT)

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

TOKEN.defineTransition(tokenizer =>/[^\d\w_]/.test(tokenizer.lastPeekingChar) && isKeyWord(tokenizer.allPeeking), KEYWORD);
TOKEN.defineTransition(tokenizer =>/[^\d\w_]/.test(tokenizer.lastPeekingChar), IDENT);


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