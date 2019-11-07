import { ShaderGraph } from "./shader-graph";
import { ShaderFunction } from "./shader-function";
import { findFirst } from "../util/array";
import { CodeBuilder } from "./util/code-builder";
import {
  ShaderFunctionNode, ShaderNode, ShaderInputNode, ShaderTextureFetchNode,
  ShaderCombineNode, ShaderConstNode, ShaderSwizzleNode
} from "./shader-node";
import { GLDataType2ShaderString } from "../core/data-type";


export function genFragShader(graph: ShaderGraph, isWebGl2: boolean)
  : { results: string, needDerivative: boolean } {
  const builder = new CodeBuilder()
  builder.reset();

  const gl2FragOutputName = 'fragColor'
  if (isWebGl2) {
    builder.writeLine(`out vec4 ${gl2FragOutputName};`)
  }
  builder.writeLine("void main(){")
  builder.addIndent()

  const evaluatedNode = new Map<ShaderNode, varRecord>();
  const nodeDependList = graph.fragmentRoot.getTopologicalSortedList() as ShaderNode[];
  const fragResult = codeGenGraph(
    nodeDependList, isWebGl2 ? gl2FragOutputName : "gl_FragColor", evaluatedNode, isWebGl2
  );
  builder.writeBlock(fragResult.code)
  pushListToMap(evaluatedNode, fragResult.varList)

  builder.reduceIndent()
  builder.writeLine("}")
  const mainCode = builder.output();

  const { functionsStr, needDerivative } = genShaderFunctionDepend(evaluatedNode, isWebGl2);

  return { results: functionsStr + mainCode, needDerivative };
}


export function genVertexShader(graph: ShaderGraph, isWebGl2: boolean): string {
  const builder = new CodeBuilder()
  builder.reset();

  builder.writeLine("void main(){")
  builder.addIndent()

  const evaluatedNode = new Map<ShaderNode, varRecord>();
  const nodeDependList = graph.vertexRoot.getTopologicalSortedList() as ShaderNode[];
  const vertexResult = codeGenGraph(nodeDependList, "gl_Position", evaluatedNode, isWebGl2)
  pushListToMap(evaluatedNode, vertexResult.varList)
  builder.writeBlock(vertexResult.code)
  builder.writeLine("gl_PointSize = 5.0;") // TODO
  builder.emptyLine()

  graph.varyings.forEach((varyNode, key) => {
    const varyDependList = varyNode.source.getTopologicalSortedList() as ShaderNode[];
    const varyResult = codeGenGraph(varyDependList, key, evaluatedNode, isWebGl2);
    pushListToMap(evaluatedNode, varyResult.varList)
    builder.writeBlock(varyResult.code)
    builder.emptyLine()
  })

  builder.reduceIndent()
  builder.writeLine("}")
  const mainCode = builder.output();

  const includedCode = genShaderFunctionDepend(evaluatedNode, isWebGl2).functionsStr;

  return includedCode + mainCode
}

function pushListToMap(map: Map<ShaderNode, varRecord>, list: varRecord[]) {
  list.forEach(item => {
    if (!map.has(item.refedNode)) {
      map.set(item.refedNode, item)
    }
  })
}


function genShaderFunctionDepend(nodes: Map<ShaderNode, varRecord>, isWebGl2: boolean)
  : { functionsStr: string, needDerivative: boolean } {
  let needDerivative = false;
  let functionsStr = "\n";
  const dependFunctions = new Set<ShaderFunction>();
  nodes.forEach((_record, node) => {
    if (node instanceof ShaderFunctionNode) {
      dependFunctions.add(node.factory)
    }
  })

  const resolvedFunction = new Set<ShaderFunction>();
  dependFunctions.forEach(func => {
    const ret = func.genShaderFunctionIncludeCode(resolvedFunction, isWebGl2);
    needDerivative = needDerivative || ret.needDerivative
    functionsStr += ret.result
    functionsStr += "\n"
  })
  return { functionsStr, needDerivative }
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
  preEvaluatedList: Map<ShaderNode, varRecord>,
  isWebGl2: boolean,
): string {
  function findRecordFromEvaluatedNode(node: ShaderNode) {
    let record: varRecord | undefined;
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

    // if (record.refedNode.enableSwizzle) {
    //   return key + "." + record.refedNode.swizzleType;
    // } else {
    //   return key;
    // }
    return key
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
      if (nodeDepend === undefined) {
        throw `we have a shader function node but the input <${key}> has no input node`
      }
      functionInputs += getParamKeyFromVarList(nodeDepend);
      if (index !== Object.keys(functionDefine.inputs).length - 1) {
        functionInputs += ", "
      }
    })
    const result = `${functionDefine.name}(${functionInputs})`
    return result;
  }

  if (node instanceof ShaderInputNode) {
    return (node as ShaderInputNode).name;
  }

  if (node instanceof ShaderTextureFetchNode) {
    if (isWebGl2) {
      return `texture(${node.source.name}, ${getParamKeyFromVarList(node.fetchByNode)})`
    } else {
      return `texture2D(${node.source.name}, ${getParamKeyFromVarList(node.fetchByNode)})`
    }
  }

  if (node instanceof ShaderCombineNode) {
    let combineResult = "";
    node.combines.forEach((nodeDepend, index) => {
      combineResult += getParamKeyFromVarList(nodeDepend);
      if (index !== node.combines.length - 1) {
        combineResult += ", "
      }
    })
    const result = `vec${node.combineCount}(${combineResult})`
    return result;
  }

  if (node instanceof ShaderConstNode) {
    return node.shaderString;
  }

  if (node instanceof ShaderSwizzleNode) {
    return getParamKeyFromVarList(node.from) + '.' + node.swizzleType;
  }


  throw "unknown shader node"
}


function codeGenGraph(
  nodeDependList: ShaderNode[],
  rootOutputName: string,
  preEvaluatedList: Map<ShaderNode, varRecord>,
  isWebGl2: boolean
): {
  code: string,
  varList: varRecord[]
} {
  const builder = new CodeBuilder()
  builder.reset();

  const varList: varRecord[] = [];
  nodeDependList.forEach(nodeToGen => {
    const varName = 'var' + nodeToGen.guid;
    varList.push({
      refedNode: nodeToGen,
      varKey: varName,
      expression: genTempVarExpFromShaderNode(nodeToGen, varList, preEvaluatedList, isWebGl2),
    })
  })
  varList.forEach(varRc => {
    if (varRc.refedNode instanceof ShaderInputNode) {
      return;
    }
    if (preEvaluatedList.has(varRc.refedNode)) {
      return;
    }
    const varType = GLDataType2ShaderString(varRc.refedNode.type);
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