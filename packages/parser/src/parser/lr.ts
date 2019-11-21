import { Nullable } from "@artgl/shared"
import { NonTerminal, Terminal, ParseSymbol } from "./parse-symbol";
import { ParseStateNode, constructParseGraph } from "./state-node";

export class LR1Parser {
  constructor(rootSymbol: NonTerminal) {
    this.rootSymbol = rootSymbol;
    this.parseStateGraph = constructParseGraph(this.rootSymbol);
  }
  private parseStateGraph: ParseStateNode;
  private rootSymbol: NonTerminal;

  private input: Terminal[] = [];
  private read: number = 0;

  private X: Nullable<ParseSymbol> = null;
  private symbolStack: ParseSymbol[] = [];
  private stateStack: ParseStateNode[] = [];

  parse(input: Terminal[]): ParseSymbol {
    this.input = input;
    this.read = 0;
    this.X = null;
    this.stateStack = [];
    this.stateStack = [];
    return this.parseAll();
  }

  private parseAll() {
    this.stateStack.push(this.parseStateGraph); // put initial state
    let result: ParseSymbol | undefined;

    let preventEndless = 0;
    while (result === undefined) {
      preventEndless++;
      if (preventEndless > 10000) {
        throw 'endless'
      }

      result = this.parseStep();
    }

    return result!;
  }

  private parseStep() {

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

}
