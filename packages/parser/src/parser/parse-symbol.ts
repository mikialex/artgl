import { Nullable } from "@artgl/shared";
import { unionSet } from "../util";
import { ParseConfiguration } from "./parse-configuration";


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

  // I0 = CLOSURE( { [S->.u1, $], [S->.u2, $] , ... [S->.un, $] } )
  genStartStateConfigs() {
    const result: ParseConfiguration[] = []
    this.rules.forEach(r => {
      const firstConf = new ParseConfiguration(r, 0, new Set([EOF]))
      firstConf.genClosureParseConfigurations().forEach(conf => result.push(conf));
    })
    return result;
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
