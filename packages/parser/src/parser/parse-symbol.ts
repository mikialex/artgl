import { Nullable } from "@artgl/shared";
import { unionSet } from "../util";


export class ParseSymbol{
  constructor(name: string) {
    this.name = name;
  }
  name: string
}

export function makeTerminal(name: string) {
  return new Terminal(name);
}

export class Terminal extends ParseSymbol{ }

class EmptyC extends Terminal{ }
class EOFc extends Terminal{ }
export const Empty = new EmptyC('empty');
export const EOF = new EOFc('eof');

export function makeNonTerminal(name: string) {
  return new NonTerminal(name);
}

export class NonTerminal extends ParseSymbol {

  rules: ProductionRule[] = [];
  firstSetCache: Nullable<Set<Terminal>> = null;

  addRule(ruleDes: ParseSymbol[]) {
    this.rules.push(new ProductionRule(this, ruleDes));
    return this;
  }

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

export function getFirstSetForAnyProduction(equalsTo: ParseSymbol[]) {
  const ruleSet = new Set<Terminal>();
  for (let i = 0; i < equalsTo.length; i++) {
    const symbol = equalsTo[i];

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

// A –> XYZ
export class ProductionRule {
  constructor(self: NonTerminal, equalsTo: ParseSymbol[]) {
    this.selfSymbol = self;
    this.equalsTo = equalsTo;
  }
  readonly selfSymbol: NonTerminal
  readonly equalsTo: ParseSymbol[] = [];

  getOneRuleFirstSet(): Set<Terminal> {
    return getFirstSetForAnyProduction(this.equalsTo);
  }

  getFirstSymbol() {
    return this.equalsTo[0];
  }
}

// A –> X•YZ, a/b
export class ParseConfiguration {
  constructor(
    private rule: Readonly<ProductionRule>,
    private _stage: number = 0,
    private lookAheadSet: Set<Terminal> = new Set()
  ) { }

  toString() {
    let rule = ''
    this.rule.equalsTo.forEach((sym, index) => {
      if (this._stage === index) {
        rule += "• ";
      }
      rule += sym.name
      rule += ' '
    })
    let lookAhead = ''
    let count = 0;
    this.lookAheadSet.forEach(sym => {
      count++;
      lookAhead += sym.name;
      if (count < this.lookAheadSet.size) {
        lookAhead += ' / ';
      }
    })
    return `${this.rule.selfSymbol.name} => ${rule}, (${lookAhead})`;
  }

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

  makeSuccessor() {
    if (this.isComplete) {
      return null;
    } else {
      return new ParseConfiguration(this.rule, this._stage + 1, this.lookAheadSet);
    }
  }

  get expectNextSymbol() {
    if (this.isComplete) {
      return null;
    } else {
      return this.rule.equalsTo[this._stage];
    }
  }

  genClosureParseConfigurations(): ParseConfiguration[] {
    const result: ParseConfiguration[] = [];
    const checking: ParseConfiguration[] = [];
    checking.push(this);

    while (checking.length > 0) {
      const checkItem = checking.pop()!;
      result.push(checkItem);

      const nextSymbol = checkItem.rule.equalsTo[this._stage];

      if (nextSymbol instanceof NonTerminal) {
        nextSymbol.rules.forEach(r => {
          const startConf = new ParseConfiguration(r);
          checking.push(startConf);
        })
      }

    }

    return result;
  }
}