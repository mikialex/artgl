import { ShaderGraph } from "./shader-graph";
import { ShaderFunction } from "./shader-function";
import { getShaderTypeStringFromGLDataType } from "../webgl/shader-util";
import { findFirst } from "../util/array";
import { CodeBuilder } from "./util/code-builder";
import { ShaderFunctionNode, ShaderNode, ShaderInputNode, ShaderTextureFetchNode } from "./shader-node";

const builder = new CodeBuilder()

export function genFragShader(graph: ShaderGraph): string {
  let result = "";

  const nodeDependList = graph.fragmentRoot.generateDependencyOrderList() as ShaderNode[];
  result += genShaderFunctionDepend(nodeDependList)
  result += "\n"
  result += codeGenGraph(nodeDependList, "gl_FragColor")
  return result;
}


export function genVertexShader(graph: ShaderGraph): string {
  let result = "";

  const nodeDependList = graph.vertexRoot.generateDependencyOrderList() as ShaderNode[];
  result += genShaderFunctionDepend(nodeDependList)
  result += "\n"
  result += codeGenGraph(nodeDependList, "gl_Position")
  return result;
}



function genShaderFunctionDepend(nodes: ShaderNode[]): string {
  let functionsStr = "\n";
  const dependFunctions = new Set<ShaderFunction>();
  nodes.forEach(node => {
    if (node instanceof ShaderFunctionNode) {
      dependFunctions.add(node.factory)
    }
  })
  dependFunctions.forEach(func => {
    functionsStr += genShaderFunctionDeclare(func)
    functionsStr += "\n"
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
  function getParamKeyFromVarList(ctx: varRecord[], node: ShaderNode): string {
    const record = findFirst(ctx, varRc => {
      return varRc.refedNode === node
    })

    if (record === undefined) {
      throw "_var_miss"
    }

    let key = "";

    // if depends input node, just use it.
    if (record.refedNode instanceof ShaderInputNode) {
      key = record.refedNode.name;
    } else {
      key = record.varKey;
    }

    if (record.refedNode.enableSwizzle) {
      return key + "." + record.refedNode.swizzleType;
    } else {
      return key;
    }
  }

  if (node instanceof ShaderFunctionNode) {
    const functionDefine = node.factory.define;

    let functionInputs = "";
    Object.keys(functionDefine.inputs).forEach((key, index) => {
      const nodeDepend = node.inputMap.get(key) as ShaderNode;
      functionInputs += getParamKeyFromVarList(ctx, nodeDepend);
      if (index !== Object.keys(functionDefine.inputs).length - 1) {
        functionInputs += ", "
      }
    })

    const result = `${functionDefine.name}(${functionInputs});`
    return result;
  }

  if (node instanceof ShaderInputNode) {
    return (node as ShaderInputNode).name + ';';
  }

  if (node instanceof ShaderTextureFetchNode) {
    return `texture2D(${node.source.name}, ${getParamKeyFromVarList(ctx, node.fetchByNode)})`
  }

  throw "unknown shader node"
}


function codeGenGraph(
  nodeDependList: ShaderNode[],
  rootOutputName: string): string {
  builder.reset();
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
      if (varRc.refedNode instanceof ShaderFunctionNode) {
        const varType = getShaderTypeStringFromGLDataType(varRc.refedNode.factory.define.returnType);
        builder.writeLine(`${varType} ${varRc.varKey} = ${varRc.expression}`)
      }
      if (varRc.refedNode instanceof ShaderTextureFetchNode) {
        const varType = getShaderTypeStringFromGLDataType(varRc.refedNode.returnType);
        builder.writeLine(`${varType} ${varRc.varKey} = ${varRc.expression}`)
      }
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
  Object.keys(functionDefine.inputs).forEach((key, index) => {
    const paramType = getShaderTypeStringFromGLDataType(functionDefine.inputs[key]);
    const paramStr = `${paramType} ${key}`
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