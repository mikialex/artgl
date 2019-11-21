import { ParseSymbol, NonTerminal } from "./parse-symbol";
import { ParseConfiguration } from './parse-configuration';

export function constructParseGraph(rootSymbol: NonTerminal) {
  const resultNodes = [];
  const checkingNodes = [];
  const configNodeMap = new Map<string, ParseStateNode>()

  function registerMap(node: ParseStateNode) {
    node.selfConfigs.forEach(conf => configNodeMap.set(conf.toString(), node));
  }

  const rootNode = new ParseStateNode();
  rootNode.selfConfigs = rootSymbol.genStartStateConfigs();
  checkingNodes.push(rootNode);
  registerMap(rootNode);

  while (checkingNodes.length > 0) {
    const checkNode = checkingNodes.pop()!;
    resultNodes.push(checkNode);

    checkNode.selfConfigs.forEach(c => {
      const next = c.makeSuccessor();

      if (next === null) {
        return
      }

      const nextKey = next.toString();
      const createdNode = configNodeMap.get(nextKey);
      if (createdNode === undefined) {

        const newNode = new ParseStateNode();
        newNode.selfConfigs = next.genClosureParseConfigurations();
        checkingNodes.push(rootNode);
        registerMap(newNode);

        checkNode.transitions.set(c.expectNextSymbol!, newNode)
      } else {
        checkNode.transitions.set(c.expectNextSymbol!, createdNode)
      }

    })
  }

  return rootNode;
}

export class ParseStateNode {

  next(symbol: ParseSymbol) {
    return this.transitions.get(symbol);
  }

  selfConfigs: ParseConfiguration[] = [];
  transitions: Map<ParseSymbol, ParseStateNode> = new Map();

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
