import { RenderGraphNode } from "../render-node";
import { EntityList } from "../entity-list";

export class InputNode extends RenderGraphNode {
  constructor(keyName: string) {
    super(keyName);
  }

  private input: EntityList;
  setInput(input: EntityList) {
    this.input = input;
  }
}
