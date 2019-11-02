
export interface GLSLToken {
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number,
  value: string,
  type: GLSLTokenType
}

export enum GLSLTokenType {
  NORMAL = 'normal',      // <-- never emitted
  TOKEN = 'token',         // <-- never emitted
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
