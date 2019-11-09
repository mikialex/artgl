import { Nullable } from "../../type"

enum Token {
  AddOperator,
  MinusOperator,
  Left, Right,
  Number,
}

const exp = make()
const term = make()

term
  .list(Token.Number)
  .list(Token.Left, exp, Token.Right)

exp
  .list(term)
  .list(exp, Token.AddOperator, exp)

const parser = makeParser([
  exp, term
])

parser.parse([Token.Number])



function list(input: any[]) {

}

function alt(input: any[]) {

}

function make(): any {

}

function makeParser(p: any): any {

}

type ParseSymbol = NoDeterminant | Token;


class NoDeterminant {
  constructor(name: string) {
    this.name = name;
  }
  name: string
  rules: ProductionRule[] = [];
}


// A –> XYZ
class ProductionRule {
  constructor(self: NoDeterminant) {
    this.selfSymbol = self;
  }
  selfSymbol: NoDeterminant
  equalsTo: ParseSymbol[] = [];

  allParseConf: ParseConfiguration[] = [];

  getFirstParseConf() {
    return this.allParseConf[0];
  }

  getFirstSymbol() {
    return this.equalsTo[0];
  }
}

// A –> X•YZ
class ParseConfiguration {
  constructor(
    private rule: Readonly<ProductionRule>,
  ) { }

  private _stage: number = 0;

  get originRule() {
    return this.rule;
  }

  get fromSymbol() {
    return this.rule.selfSymbol;
  }

  get isStart() {
    return this._stage === 0;
  }

  get isComplete() {
    return this._stage === this.rule.equalsTo.length;
  }

  get successor() {
    if (this.isComplete) {
      return null;
    } else {
      return this.rule.allParseConf[this._stage + 1];
    }
  }

  get expectNextSymbol() {
    if (this.isComplete) {
      return null;
    } else {
      return this.rule.equalsTo[this._stage];
    }
  }

  genClosureParseConfigurationSet(): Set<ParseConfiguration> {
    const nextSymbol = this.rule.equalsTo[this._stage];
    if (nextSymbol === undefined) {
      return new Set([this]);
    }

    const result: Set<ParseConfiguration> = new Set([this]);

    function pushResult(symbol: ParseSymbol) {
      if (!(symbol instanceof NoDeterminant)) {
        return;
      }
      symbol.rules.forEach(r => {
        const startConf = r.getFirstParseConf();
        result.add(startConf);
        pushResult(r.getFirstSymbol());
      })
    }

    pushResult(nextSymbol);
    return result;
  }
}

class ParseStateNode {
  constructor(c: ParseConfiguration, isRoot: boolean) {

    if (isRoot) {
      this.selfConfigs.add(c);
      c.fromSymbol.rules.forEach(r => {
        r.getFirstParseConf().genClosureParseConfigurationSet().forEach(cf => {
          this.selfConfigs.add(cf);
        })
      })
    } else {
      this.selfConfigs = c.genClosureParseConfigurationSet()
    }

    this.populateNextStates();

  }

  next(symbol: ParseSymbol) {
    return this.transitions.get(symbol);
  }

  private populateNextStates() {
    this.selfConfigs.forEach(c => {
      this.populateNextState(c);
    })
  }

  private populateNextState(c: ParseConfiguration) {
    const next = c.successor;
    if (next === null) { return }
    this.transitions.set(c.expectNextSymbol!, new ParseStateNode(next, false))
  }

  private selfConfigs: Set<ParseConfiguration> = new Set();
  private transitions: Map<ParseSymbol, ParseStateNode> = new Map();

  get isReduceable() {
    return this.transitions.size === 0 && this.selfConfigs.size === 1;
  }

  get reduceConfig(): ParseConfiguration {
    return this.selfConfigs.values().next().value
  }

  get reduceSymbol() {
    return this.reduceConfig.fromSymbol
  }
}

// class ParseStateGraph{
//   constructor(
//     private root: ParseStateNode,
//   ) {

//   }
//   nodes: Set<ParseStateNode>
// }


export class LRParser {
  constructor(rootSymbol: NoDeterminant) {
    this.rootSymbol = rootSymbol;
    this.parseStateGraph = new ParseStateNode(this.rootSymbol.rules[0].getFirstParseConf(), true);
  }

  input: Token[] = [];
  read: number = 0;

  X: Nullable<ParseSymbol> = null;
  symbolStack: ParseSymbol[] = [];
  stateStack: ParseStateNode[] = [];

  private parseAll() {
    this.stateStack.push(this.parseStateGraph);
  }

  private parse() {
    const next = this.shift();

    const stateStackTop = this.stateStack[this.stateStack.length - 1];
    if (stateStackTop.isReduceable) {
      const nextState = stateStackTop.next(this.X!);
      if (nextState === undefined) {
        throw 'parse failed'
      }
      this.stateStack.push(nextState);
      if (this.X instanceof NoDeterminant) {
        this.stateStack.push(nextState);
      } else {

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

  private readInput() {
    const next = this.input[this.read];
    this.symbolStack.push(next);
    this.read++;
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
  allNoDeterminant: Set<NoDeterminant> = new Set();
  rootSymbol: NoDeterminant;
}
