import { ShaderGraph } from "./shader-graph";
import { ShaderFunctionNode, ShaderFunction } from "./shader-function";
import { getShaderTypeStringFromGLDataType } from "../webgl/shader-util";
import { findFirst } from "../util/array";
import { CodeBuilder } from "./util/code-builder";

const builder = new CodeBuilder()

export function genFragmentShader(graph: ShaderGraph): string {
  let result = "";
  result += genShaderFunctionDepend(graph)
  result += "\n"
  result += codeGenGraph(graph)
  return result;
}

function genShaderFunctionDepend(graph: ShaderGraph): string {
  let functionsStr = "\n";
  const dependFunctions = {};
  graph.functionNodes.forEach(node => {
    if (dependFunctions[node.factory.define.name] === undefined) {
      dependFunctions[node.factory.define.name] = node.factory;
    }
  })
  Object.keys(dependFunctions).forEach(key => {
    functionsStr += genShaderFunctionDeclare(dependFunctions[key])
  })
  return functionsStr
}

// temp1 = asd(12 + d);
interface varRecord {
  refedNode: ShaderFunctionNode, 
  varKey: string,
  expression: string,
}

function genTempVarExpFromShaderFunction(
  node: ShaderFunctionNode,
  tempVarName: string,
  ctx: varRecord[]
): string {
  const functionDefine = node.factory.define;
  const varType = getShaderTypeStringFromGLDataType(functionDefine.returnType);

  function getParamKeyFromVarList(ctx: varRecord[], node: ShaderFunctionNode): string {
    const record = findFirst(ctx, varRc => {
      return varRc.refedNode === node
    })

    if (record === undefined) {
      return "_var_miss"
    } else {
      return record.varKey
    }
  }

  let functionInputs = "";
  functionDefine.inputs.forEach((_inputDefine, index) => {
    const nodeDepend = node.getFromNodeByIndex(index) as ShaderFunctionNode;
    functionInputs += getParamKeyFromVarList(ctx, nodeDepend);
    if (index !== functionDefine.inputs.length - 1) {
      functionInputs += ", "
    }

  })
  const result = `${varType} ${tempVarName} = ${functionDefine.name}(${functionInputs});`
  return result;
}


function codeGenGraph(graph: ShaderGraph): string {
  builder.reset();
  const nodeDependList = graph.getEffectRoot().generateDependencyOrderList() as ShaderFunctionNode[];
  const varList: varRecord[] = [];
  nodeDependList.forEach(nodeToGen => {
    const varName = nodeToGen.uuid.slice(0, 4);
    varList.push({
      refedNode: nodeToGen, 
      varKey: varName,
      expression: genTempVarExpFromShaderFunction(
        nodeToGen,  varName, varList
      ),
    })
  })
  builder.writeLine("void main(){")
  builder.addIndent()
  varList.forEach(varRc => {
    builder.writeLine(varRc.expression)
  })
  builder.reduceIndent()
  builder.writeLine("}")
  return builder.output();
}

function genShaderFunctionDeclare(shaderFunction: ShaderFunction): string {
  builder.reset();
  const functionDefine = shaderFunction.define;
  const varType = getShaderTypeStringFromGLDataType(functionDefine.returnType);
  let functionInputs = "";
  functionDefine.inputs.forEach((inputDefine, index) => {
    const paramType = getShaderTypeStringFromGLDataType(functionDefine.returnType);
    const paramStr = `${paramType} ${inputDefine.name}`
    functionInputs += paramStr
    if (index !== functionDefine.inputs.length - 1) {
      functionInputs += ", "
    }
  })

  builder.writeLine(`${varType} ${functionDefine.name}(${functionInputs}){`)
  builder.addIndent()
  builder.writeBlock(functionDefine.source)
  builder.reduceIndent()
  builder.writeLine("}")
  return builder.output();
}