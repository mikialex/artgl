import { ShaderGraph } from "./shader-graph";
import { ShaderFunctionNode } from "./shader-function";

export function genFragmentShader(graph: ShaderGraph): string {
  let result = "";
  result += genShaderFunctionDepend(graph)
  return result;
}

function genShaderFunctionDepend(graph: ShaderGraph): string {
  return ""
}

// temp1 = asd(12 + d);
interface varRecord {
  refNode: ShaderFunctionNode, 
  varKey: string,
  expression: string,
}

function createVarRecord(varRecordList: varRecord[]) {
  
}