import { ParseSymbol } from "./parse-symbol";
import { ParseConfiguration } from './parse-configuration';

export class ParseStateNode {
  constructor(c: ParseConfiguration, isRoot: boolean) {

    if (isRoot) {
      this.selfConfigs.push(c);
      c.fromSymbol.rules.forEach(r => {
        const firstConf = new ParseConfiguration(r)
        firstConf.genClosureParseConfigurations().forEach(cf => {
          this.selfConfigs.push(cf);
        })
      })
    } else {
      this.selfConfigs = c.genClosureParseConfigurations()
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
    const next = c.makeSuccessor();
    if (next === null) { return }
    this.transitions.set(c.expectNextSymbol!, new ParseStateNode(next, false))
  }

  private selfConfigs: ParseConfiguration[] = [];
  private transitions: Map<ParseSymbol, ParseStateNode> = new Map();

  get isReduceable() {
    return this.transitions.size === 0 && this.selfConfigs.length === 1;
  }

  get reduceConfig(): ParseConfiguration {
    return this.selfConfigs.values().next().value
  }

  get reduceSymbol() {
    return this.reduceConfig.fromSymbol
  }
}
