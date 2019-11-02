import { generateUUID } from "../math/uuid";

enum ASTNodeType{

}

class ASTNode {
  type: ASTNodeType;
  children: ASTNode[] = [];
  uuid: string = generateUUID();
}

function mknode(mode, sourcetoken): ASTNode {
  return new ASTNode();
}


class ParseState {
  states = [];

  get current() {
    return this.states[0];
  }

  shift() {
    
  }

  unshift() {

  }
}

export class GLSLParser {
  errored: boolean
  state: ParseState
  token: GLSLToken
  readedToken: GLSLToken[]

  stative() {
    var steps = [].slice.call(arguments)
      , step
      , result

    return function () {
      var current = this.state.current;

      current.stage || (current.stage = 0)

      step = steps[current.stage]
      if (!step) return unexpected('parser in undefined state!')

      result = step()

      if (result === Advance) return ++current.stage
      if (result === undefined) return
      current.stage = result
    }
  }

  unexpected(str: string) {
    this.errored = true
    throw new Error(
      (str || 'unexpected ' + state) +
      ' at line ' + state[0].token.line
    )
  }
}
