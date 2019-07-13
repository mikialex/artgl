import { ShaderGraph } from "./shader-graph";
import { ShaderFunction } from "./shader-function";
import { getShaderTypeStringFromGLDataType } from "../webgl/shader-util";
import { findFirst } from "../util/array";
import { CodeBuilder } from "./util/code-builder";
import { ShaderFunctionNode, ShaderNode, ShaderInputNode, ShaderTextureFetchNode } from "./shader-node";

export function genFragShader(graph: ShaderGraph): string {
  const builder = new CodeBuilder()
  builder.reset();

  const nodeDependList = graph.fragmentRoot.generateDependencyOrderList() as ShaderNode[];
  builder.writeBlockRaw(genShaderFunctionDepend(nodeDependList))
  builder.emptyLine()

  builder.writeLine("void main(){")
  builder.addIndent()

  builder.writeBlock(codeGenGraph(nodeDependList, "gl_FragColor"))

  builder.reduceIndent()
  builder.writeLine("}")
  return builder.output();
}


export function genVertexShader(graph: ShaderGraph): string {
  const builder = new CodeBuilder()
  builder.reset();

  const nodeDependList = graph.vertexRoot.generateDependencyOrderList() as ShaderNode[];
  builder.writeBlockRaw(genShaderFunctionDepend(nodeDependList))
  builder.emptyLine()

  builder.writeLine("void main(){")
  builder.addIndent()

  builder.writeBlock(codeGenGraph(nodeDependList, "gl_Position"))
  builder.emptyLine()

  graph.varyings.forEach((varyNode, key) => {
    const varyDependList =  varyNode.generateDependencyOrderList() as ShaderNode[];
    builder.writeBlock(codeGenGraph(varyDependList, key))
    builder.emptyLine()
  })

  builder.reduceIndent()
  builder.writeLine("}")
  return builder.output();
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
    functionsStr += func.genShaderFunctionIncludeCode()
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
  const builder = new CodeBuilder()
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
  return builder.output();
}
