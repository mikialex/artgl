import { ShaderGraph } from "./shader-graph";
import { ShaderFunction } from "./shader-function";
import { getShaderTypeStringFromGLDataType } from "../webgl/shader-util";
import { findFirst } from "../util/array";
import { CodeBuilder } from "./util/code-builder";
import { ShaderFunctionNode, ShaderNode } from "./shader-node";

const builder = new CodeBuilder()

// export function genFragShader(graph: ShaderGraph): string {
//   let result = "";
//   result += genShaderFunctionDepend(graph)
//   result += "\n"
//   result += codeGenGraph(graph.effectRoot, "gl_FragColor")
//   return result;
// }


// export function genVertexShader(graph: ShaderGraph): string {
//   let result = "";
//   result += genShaderFunctionDepend(graph)
//   result += "\n"
//   result += codeGenGraph(graph.transformRoot, "gl_Position")
//   return result;
// }



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
  refedNode: ShaderNode,
  varKey: string,
  expression: string,
}

function genTempVarExpFromShaderNode(
  node: ShaderNode,
  ctx: varRecord[]
): string {
  if (node instanceof ShaderFunctionNode) {
    const functionDefine = node.factory.define;

    function getParamKeyFromVarList(ctx: varRecord[], node: ShaderNode): string {
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
      const nodeDepend = node.getFromNodeByIndex(index) as ShaderNode;
      functionInputs += getParamKeyFromVarList(ctx, nodeDepend);
      if (index !== functionDefine.inputs.length - 1) {
        functionInputs += ", "
      }

    })
    const result = `${functionDefine.name}(${functionInputs});`
    return result;
  } else {
    return node.name + ';';
  }
}


function codeGenGraph(
  root: ShaderFunctionNode,
  rootOutputName: string): string {
  builder.reset();
  const nodeDependList = root.generateDependencyOrderList() as ShaderNode[];
  const varList: varRecord[] = [];
  nodeDependList.forEach(nodeToGen => {
    const varName = 'var' + nodeToGen.uuid.slice(0, 4);
    varList.push({
      refedNode: nodeToGen,
      varKey: varName,
      expression: genTempVarExpFromShaderNode(nodeToGen, varList),
    })
  })
  builder.writeLine("void main(){")
  builder.addIndent()
  varList.forEach((varRc, index) => {
    if (index !== varList.length - 1) {
      let varType: string;
      if (varRc.refedNode instanceof ShaderFunctionNode) {
        varType = getShaderTypeStringFromGLDataType(varRc.refedNode.factory.define.returnType);
      } else {
        varType = getShaderTypeStringFromGLDataType(varRc.refedNode.dataType);
      }
      builder.writeLine(`${varType} ${varRc.varKey} = ${varRc.expression}`)
    } else {
      builder.writeLine(`${rootOutputName} = ${varRc.expression}`)
    }
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
    const paramType = getShaderTypeStringFromGLDataType(inputDefine.type);
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