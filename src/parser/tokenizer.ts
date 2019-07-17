import { GLSLTokenType, GLSLToken } from "./tokenizer/token";


export class GLSLTokenizerDemo{
  tokens: [];
  input: string;
  peek: number;
  read: number;

  currentLine: number;
  currentCol: number;
  currentMode: GLSLTokenType;

  reset() {
    this.tokens = [];
    this.input = "";
    this.peek = 0;
    this.read = 0;
  
    this.currentLine= 0;
    this.currentCol = 0;
    this.currentMode = GLSLTokenType.NORMAL;
  }

  readToken() {

  }

  tokenize(input: string): GLSLToken[] {
    this.reset();
    this.input = input;
    return this.tokens.slice();
  }
}