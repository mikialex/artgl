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

  const evaluatedNode = new Map<ShaderNode, varRecord>();
  builder.writeBlock(codeGenGraph(nodeDependList, "gl_FragColor", evaluatedNode).code)

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

  const evaluatedNode = new Map<ShaderNode, varRecord>();
  const vertexResult = codeGenGraph(nodeDependList, "gl_Position", evaluatedNode)
  pushListToMap(evaluatedNode, vertexResult.varList)
  builder.writeBlock(vertexResult.code)
  builder.emptyLine()

  graph.varyings.forEach((varyNode, key) => {
    const varyDependList = varyNode.generateDependencyOrderList() as ShaderNode[];
    const varyResult = codeGenGraph(varyDependList, key, evaluatedNode);
    pushListToMap(evaluatedNode, vertexResult.varList)
    builder.writeBlock(varyResult.code)
    builder.emptyLine()
  })

  builder.reduceIndent()
  builder.writeLine("}")
  return builder.output();
}

function pushListToMap(map:Map<ShaderNode, varRecord>, list:varRecord[]) {
  list.forEach(item => {
    if (!map.has(item.refedNode)) {
      map.set(item.refedNode, item)
    }
  })
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
  ctx: varRecord[],
  preEvaluatedList: Map<ShaderNode, varRecord>
): string {
  function findRecordFromEvaluatedNode(node: ShaderNode) {
    let record: varRecord;
    if (preEvaluatedList.has(node)) {
      record = preEvaluatedList.get(node)
    } else {
      record = findFirst(ctx, varRc => {
        return varRc.refedNode === node
      })
    }
    return record;
  }

  function genRecordVar(record: varRecord): string {
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

  function getParamKeyFromVarList(node: ShaderNode): string {
    const record = findRecordFromEvaluatedNode(node);
    if (record === undefined) {
      throw "_var_miss"
    }
    return genRecordVar(record);
  }

  let record = findRecordFromEvaluatedNode(node)
  if (record) {
    return genRecordVar(record);
  }

  if (node instanceof ShaderFunctionNode) {
    const functionDefine = node.factory.define;

    let functionInputs = "";
    Object.keys(functionDefine.inputs).forEach((key, index) => {
      const nodeDepend = node.inputMap.get(key) as ShaderNode;
      functionInputs += getParamKeyFromVarList(nodeDepend);
      if (index !== Object.keys(functionDefine.inputs).length - 1) {
        functionInputs += ", "
      }
    })

    const result = `${functionDefine.name}(${functionInputs})`
    return result;
  }

  if (node instanceof ShaderInputNode) {
    return (node as ShaderInputNode).name + ';';
  }

  if (node instanceof ShaderTextureFetchNode) {
    return `texture2D(${node.source.name}, ${getParamKeyFromVarList(node.fetchByNode)})`
  }

  throw "unknown shader node"
}


function codeGenGraph(
  nodeDependList: ShaderNode[],
  rootOutputName: string,
  preEvaluatedList: Map<ShaderNode, varRecord>
): {
    code: string,
    varList: varRecord[]
  } {
  const builder = new CodeBuilder()
  builder.reset();
  const varList: varRecord[] = [];
  nodeDependList.forEach(nodeToGen => {
    const varName = 'var' + nodeToGen.uuid.slice(0, 4);
    varList.push({
      refedNode: nodeToGen,
      varKey: varName,
      expression: genTempVarExpFromShaderNode(nodeToGen, varList, preEvaluatedList),
    })
  })
  varList.forEach(varRc => {
    if (varRc.refedNode instanceof ShaderInputNode) {
      return;
    }
    const varType = getShaderTypeStringFromGLDataType(varRc.refedNode.returnType);
    builder.writeLine(`${varType} ${varRc.varKey} = ${varRc.expression};`)
  })

  const selfRecord = varList[varList.length - 1];
  if (selfRecord.refedNode instanceof ShaderInputNode) {
    builder.writeLine(`${rootOutputName} = ${selfRecord.refedNode.name};`)
  } else {
    builder.writeLine(`${rootOutputName} = ${selfRecord.varKey};`)
  }
  return {
    code: builder.output(),
    varList
  };
}
