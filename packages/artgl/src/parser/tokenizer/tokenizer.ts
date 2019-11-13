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
const OPERATOR = new StateNode(GLSLStateType.OPERATOR)
const INTEGER = new StateNode(GLSLStateType.INTEGER)
const WHITESPACE = new StateNode(GLSLStateType.WHITESPACE)
const PREPROCESSOR = new StateNode(GLSLStateType.PREPROCESSOR)
const LINE_COMMENT = new StateNode(GLSLStateType.LINE_COMMENT)
const BLOCK_COMMENT = new StateNode(GLSLStateType.BLOCK_COMMENT)

NORMAL.defineTransition(tokenizer => {
  if (tokenizer.allPeeking === '//') { return LINE_COMMENT };
  if (tokenizer.allPeeking === '/*') { return BLOCK_COMMENT };
  if (tokenizer.lastPeekingChar === '#') { return PREPROCESSOR };
  if (/\s/.test(tokenizer.lastPeekingChar)) { return WHITESPACE };
  const isNumber = /\d/.test(tokenizer.lastPeekingChar);
  const isOperator = /[^\w_]/.test(tokenizer.lastPeekingChar);
  if (isNumber) {
    return INTEGER;
  } else {
    return isOperator ? OPERATOR : TOKEN;
  }
})

TOKEN.defineTransition(tokenizer => {
  if (/[^\d\w_]/.test(tokenizer.lastPeekingChar)) {
    if (isKeyWord(tokenizer.allPeeking)) {
      tokenizer.emitToken(GLSLTokenType.KEYWORD)
      return NORMAL
    } else {
      tokenizer.emitToken(GLSLTokenType.IDENT)
      return NORMAL
    }
  }
  return TOKEN;
})

PREPROCESSOR.defineTransition(tokenizer => {
  const c = tokenizer.lastPeekingChar;
  if ((c === '\r' || c === '\n') && tokenizer.firstPeekingChar !== '\\') {
    tokenizer.emitToken(GLSLTokenType.PREPROCESSOR)
    return NORMAL;
  }
  return PREPROCESSOR;
})

LINE_COMMENT.defineTransition(tokenizer => {
  const c = tokenizer.lastPeekingChar;
  if ((c === '\r' || c === '\n') && tokenizer.firstPeekingChar !== '\\') {
    tokenizer.emitToken(GLSLTokenType.LINE_COMMENT)
    return NORMAL;
  }
  return LINE_COMMENT;
})

BLOCK_COMMENT.defineTransition(tokenizer => {
  const s = tokenizer.allPeeking;
  if (s.length >= 4 && s.slice(s.length - 2) === "*/") {
    tokenizer.emitToken(GLSLTokenType.BLOCK_COMMENT)
    return NORMAL;
  }
  return BLOCK_COMMENT;
})

WHITESPACE.defineTransition(tokenizer => {
  if (/[^\s]/g.test(tokenizer.lastPeekingChar)) {
    tokenizer.emitToken(GLSLTokenType.WHITESPACE)
    return NORMAL;
  }
  return WHITESPACE;
})

OPERATOR.defineTransition(tokenizer => {

  if (tokenizer.currentLastCharactor === '.' && /\d/.test(tokenizer.currentCharactor)) {
    return GLSLStateType.FLOAT
  }

  if (tokenizer.allPeeking === '//') { return LINE_COMMENT };
  if (tokenizer.allPeeking === '/*') { return BLOCK_COMMENT };

  if (this.currentCharactor === '.' && this.content.length) {
    while (determineOperator(this.content));

    this.switchMode(TokenType.FLOAT)
    return
  }

  if (this.currentCharactor === ';' || this.currentCharactor === ')' || this.currentCharactor === '(') {
    if (this.content.length) while (this.determineOperator(this.content));
    this.createToken(this.currentCharactor)
    this.switchMode(TokenType.NORMAL)
    this.read();
    return;
  }

  var is_composite_operator = this.content.length === 2 && this.currentCharactor !== '='
  if (/[\w_\d\s]/.test(this.currentCharactor) || is_composite_operator) {
    while (this.determineOperator(this.content));
    this.switchMode(TokenType.NORMAL)
    return
  }

  return OPERATOR;
})

export class GLSLTokenizer {
  tokens: [] = [];
  input = "";
  peeking = 0; // peek forward position
  hasRead = 0; // char before read has all tokenized

  currentLine = 0;
  currentCol = 0;
  currentMode = GLSLStateType.NORMAL;

  get lastPeekingChar() {
    return this.input[this.peeking];
  }

  get firstPeekingChar() {
    return this.input[this.hasRead];
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

  emitToken(token: GLSLTokenType, forwardSize?: number) {

  }

  tokenize(input: string): GLSLToken[] {
    this.reset();
    this.input = input;


    return this.tokens.slice();
  }
}