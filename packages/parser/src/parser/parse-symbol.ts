import { Nullable } from "@artgl/shared";


export class ParseSymbol{
  constructor(name: string) {
    this.name = name;
  }
  name: string
}

export class Terminal extends ParseSymbol{ }

class EmptyC extends Terminal{ }
class EOFc extends Terminal{ }
export const Empty = new EmptyC('empty');
export const EOF = new EOFc('eof');

export class NonTerminal extends ParseSymbol {
  rules: ProductionRule[] = [];
  firstSetCache: Nullable<Set<Terminal>> = null;

  getFirstSet(): Set<Terminal> {
    if (this.firstSetCache !== null) {
      return this.firstSetCache;
    }

    const result = new Set<Terminal>()

    this.rules.forEach(rule => {
      const ruleSet = rule.getOneRuleFirstSet();
      unionSet(result, ruleSet);
    })

    return result;
  }
}


// A –> XYZ
export class ProductionRule {
  constructor(self: NonTerminal) {
    this.selfSymbol = self;
  }
  selfSymbol: NonTerminal
  equalsTo: ParseSymbol[] = [];

  allParseConf: ParseConfiguration[] = [];

  getOneRuleFirstSet(): Set<Terminal> {
    const ruleSet = new Set<Terminal>();
    for (let i = 0; i < this.equalsTo.length; i++) {
      const symbol = this.equalsTo[i];

      if (symbol instanceof Terminal) {
        ruleSet.add(symbol);
        return ruleSet;

      } else if (symbol instanceof NonTerminal) {
        const symbolFirstSet = symbol.getFirstSet();

        if (symbolFirstSet.has(Empty)) {
          symbolFirstSet.delete(Empty);
          unionSet(ruleSet, symbolFirstSet);
        } else {
          unionSet(ruleSet, symbolFirstSet);
          return ruleSet;
        }

      }

    }

    ruleSet.add(Empty);
    return ruleSet;
  }

  getFirstParseConf() {
    return this.allParseConf[0];
  }

  getFirstSymbol() {
    return this.equalsTo[0];
  }
}

// A –> X•YZ, a/b
export class ParseConfiguration {
  constructor(
    private rule: Readonly<ProductionRule>,
  ) { }

  private _stage: number = 0;
  private lookAheadSet: Set<Terminal> = new Set();

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
      if (!(symbol instanceof NonTerminal)) {
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