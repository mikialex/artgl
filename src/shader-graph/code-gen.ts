import { ShaderGraph } from "./shader-graph";
import { ShaderFunctionNode, ShaderFunction } from "./shader-function";
import { getShaderTypeStringFromGLDataType } from "../webgl/shader-util";

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

function genTempVarExpFromShaderFunction(
  node: ShaderFunctionNode,
  tempVarName: string,
): string {
  const functionDefine = node.factory.define;
  const varType = getShaderTypeStringFromGLDataType(functionDefine.returnType);
  let functionInputs = "";
  functionDefine.inputs.forEach(inputDefine => {
    // const paramType = getShaderTypeStringFromGLDataType(functionDefine.returnType);
    // const paramStr = `${paramType} ${inputDefine.name}`
    // functionInputs += paramStr
  })
  const result = `${varType} ${tempVarName} = ${functionDefine.name}(${functionInputs});`
  return result;
}

function genShaderFunctionDeclare(shaderFunction: ShaderFunction): string {
  const functionDefine = shaderFunction.define;
  const varType = getShaderTypeStringFromGLDataType(functionDefine.returnType);
  let functionInputs = "";
  functionDefine.inputs.forEach(inputDefine => {
    const paramType = getShaderTypeStringFromGLDataType(functionDefine.returnType);
    const paramStr = `${paramType} ${inputDefine.name}`
    functionInputs += paramStr
  })
  const result = `${varType} ${functionDefine.name}(${functionInputs}){
    ${functionDefine.source}
  }`
  return result;
}