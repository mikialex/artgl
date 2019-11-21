import { ProductionRule, Terminal, getFirstSetForAnyProduction, NonTerminal } from './parse-symbol'
import { unionSet } from '../util';

// this so called configuration is not a configuration about how to parse
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
    const sortArray: Terminal[] = [];
    this.lookAheadSet.forEach(sym => {
      sortArray.push(sym);
    });
    sortArray.sort((a, b) => a.name.localeCompare(b.name));
    let lookAhead = ''
    let count = 0;
    sortArray.forEach(sym => {
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
      const restSymbol = checkItem.rule.equalsTo.slice(this._stage + 1);

      const newLookAheadSet = new Set<Terminal>();
      checkItem.lookAheadSet.forEach(symbol => {
        const restSymbolWithOldLookAhead = restSymbol.slice();
        restSymbolWithOldLookAhead.push(symbol);
        unionSet(newLookAheadSet, getFirstSetForAnyProduction(restSymbolWithOldLookAhead));
      })
      

      if (nextSymbol instanceof NonTerminal) {
        nextSymbol.rules.forEach(r => {
          const startConf = new ParseConfiguration(r, 0, new Set<Terminal>(newLookAheadSet));
          checking.push(startConf);
        })
      }

    }

    return result;
  }
}