
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


  }

  transitions: Map<ParseConfiguration, ParseStateNode> = new Map();
  selfConfigs: Set<ParseConfiguration> = new Set();

  get isReduceable() {
    return false;// todo
  }
}

// class ParseStateGraph{
//   constructor(
//     private root: ParseStateNode,
//   ) {

//   }
//   nodes: Set<ParseStateNode>
// }


class LRParser {
  constructor(rootSymbol: NoDeterminant) {
    this.rootSymbol = rootSymbol;
    this.parseStateGraph = new ParseStateNode(this.rootSymbol.rules[0].getFirstParseConf(), true);
  }

  input: Token[] = [];
  read: number = 0;

  symbolStack: ParseSymbol[] = [];
  stateStack: ParseStateNode[] = [];

  private shift() {

  }

  private reduce() {

  }

  parseStateGraph: ParseStateNode;

  parseSymbols: Set<ParseSymbol> = new Set();
  allNoDeterminant: Set<NoDeterminant> = new Set();
  rootSymbol: NoDeterminant;
}
