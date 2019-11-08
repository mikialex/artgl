
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

function makeParser(p: any): any{

}

type ParseType = NoDeterminant | Token;

enum Token {
  AddOperator,
  MinusOperator,
  Left,Right,
  Number,
}


class NoDeterminant{
  constructor(name: string) {
    this.name = name;
  }
  name: string 
  rules: ProductionRule[] = [];
}


// A –> XYZ
class ProductionRule {
  constructor(self: NoDeterminant) {
    this.selfType = self;
  }
  selfType: NoDeterminant
  equalsTo: ParseType[] = [];
}

// A –> X•YZ
class ParseConfiguration {
  constructor(
    private rule: Readonly<ProductionRule>,
  ) { }
  
  private _stage: number = 0;

  get isStart() {
    return this._stage === 0;
  }

  get isComplete() {
    return this._stage === this.rule.equalsTo.length;
  }

  generateClosureParseConfigurationSet() {
    const result = new Set();

    const next = this.rule.equalsTo[this._stage];
      if (next instanceof NoDeterminant) {
        next.rules.forEach(r => {
          const startConf = new ParseConfiguration(r);
          result.add(startConf);
        })
      }
  }
}

class ParseStateNode{
  transitions: Map<ParseConfiguration, ParseStateNode> = new Map();

  get isReduceable() {
    return false;// todo
  }
}

class ParseStateGraph{
  root: ParseStateNode
  nodes: Set<ParseStateNode>
}


class LR1Parser{
  constructor(rootType: ParseType) {
    this.rootType = rootType;
  }

  input: Token[] = [];
  read: number = 0;

  stack: ParseType[] = [];

  shift() {
    
  }

  reduce() {
    
  }

  parseTypes: Set<ParseType> = new Set();
  rootType: ParseType;
}
