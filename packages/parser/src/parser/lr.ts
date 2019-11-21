import { Nullable } from "@artgl/shared"
import { NonTerminal, Terminal, ParseSymbol } from "./parse-symbol";
import { ParseStateNode, constructParseGraph } from "./state-node";

export class LRParser {
  constructor(rootSymbol: NonTerminal) {
    this.rootSymbol = rootSymbol;
    this.parseStateGraph = constructParseGraph(this.rootSymbol);
  }

  input: Terminal[] = [];
  read: number = 0;

  X: Nullable<ParseSymbol> = null;
  symbolStack: ParseSymbol[] = [];
  stateStack: ParseStateNode[] = [];

  private parseAll() {
    this.stateStack.push(this.parseStateGraph); // put initial state
    let result;

    while (result) {
      result = this.parse();
    }

    return result;
  }

  private parse() {

    const stateStackTop = this.stateStack[this.stateStack.length - 1];
    if (stateStackTop.isReduceable) {
      const nextState = stateStackTop.next(this.X!);
      if (nextState === undefined) {
        throw 'parse failed'
      }
      if (this.X instanceof NonTerminal) {
        this.stateStack.push(nextState);
        this.shift();
      } else {
        this.stateStack.push(nextState);
        this.symbolStack.push(this.X!);
      }
    } else {
      if (stateStackTop.reduceSymbol === this.rootSymbol) {
        if (this.X !== null) {
          throw 'parse failed'
        } else {
          return this.symbolStack[0];
        }
      } else {
        this.reduce(stateStackTop);
      }
    }

  }

  private shift() {
    const next = this.input[this.read];
    this.symbolStack.push(next);
    this.read++;
    this.X = next;
    return next;
  }

  private reduce(stateStackTop: ParseStateNode) {
    const popLength = stateStackTop.reduceConfig.originRule.equalsTo.length;
    this.stateStack.splice(this.stateStack.length - popLength, popLength);
    this.symbolStack.splice(this.stateStack.length - popLength, popLength);
    this.X = stateStackTop.reduceSymbol;
  }


  parseStateGraph: ParseStateNode;

  parseSymbols: Set<ParseSymbol> = new Set();
  allNonTerminal: Set<NonTerminal> = new Set();
  rootSymbol: NonTerminal;
}
