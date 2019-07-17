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