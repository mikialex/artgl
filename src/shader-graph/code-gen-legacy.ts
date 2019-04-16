import { ShaderFunctionNode } from "./shader-function";
import { getIndent } from './util/indent';
import { NodeGraph } from '@/core/node-graph';
import { convertToValidName } from './util/convert';

export interface CodeGenVarDescriptor {
  varKey: string;
  refedNode: ShaderFunctionNode;
  exp: string;
}

export interface CodeGenContext {
  varList: CodeGenVarDescriptor[];
}

export function convertCodeGenContext2Exp(ctx: CodeGenContext): string {
  let str = '';
  const varList = ctx.varList.slice().reverse();
  const returnVar = varList.pop();
  varList.forEach(v => {
    str += `${getIndent(1)}var ${v.varKey} = ${v.exp};`;
    str += '\n';
  });

  str += `${getIndent(1)}return ${returnVar.exp}`;
  return str
}

export function codeGenFunctionParamStrFromNodeGraph(graph: NodeGraph): string {
  let str = '';
  graph.paramsMap.forEach((para, index) => {
    str += para.name;
    if (index + 1 !== graph.paramsMap.length) {
      str += ', ';
    }
  })
  return str;
}

export function codeGenFunctionFromNodeGraph(graph: NodeGraph): string {
  let functionBody = graph.returnNode.codeGen();
  let functionString = 
`function ${convertToValidName(graph.name)}(${codeGenFunctionParamStrFromNodeGraph(graph)}){
${functionBody}
}`;
  return functionString;
}

let tempId = 0;
export function codeGen(ctx: CodeGenContext) {
  const currentVar = ctx.varList[ctx.varList.length - 1];
  const nodeToGen = currentVar.refedNode;

  let str = nodeToGen.codeGenTemplate;
  if (nodeToGen.isInputNode) {
    if (nodeToGen.isGraphInput) {
      str = str.replace(`{{p1}}`, nodeToGen.nameAsGraphInput);
    } else {
      str = str.replace(`{{p1}}`, nodeToGen.getValue().toString());
    }
  } else {
    nodeToGen.inputParams.forEach((input, index) => {
      const paramNode = input.valueRef;
      let replacer;

      if (!paramNode) {
        if (!nodeToGen.config.paramsDescriptor[index].required) {
          throw 'error';
        }
        replacer = nodeToGen.config.paramsDescriptor[index].default;
      } else {
        let hasGened = false;
        let oldGenKey;
        for (let i = 0; i < ctx.varList.length; i++) {
          if (ctx.varList[i].refedNode.id === paramNode.id) {
            hasGened = true;
            oldGenKey = ctx.varList[i].varKey
            break;
          }
        }
        if (!hasGened && !paramNode.isInputNode) {
          const position = ctx.varList.length;
          tempId++;
          const newVarKey = 'temp' + tempId;
          const newVar = {
            varKey: newVarKey,
            refedNode: paramNode as GraphNode,
            exp: ''
          }
          ctx.varList.push(newVar);
          codeGen(ctx);

          if (paramNode.refedNodes.length > 1) {
            replacer = newVarKey;
          } else {
            ctx.varList.splice(position, 1);
            replacer = newVar.exp;
          }
        } else {
          if (paramNode.isInputNode) {
            if (paramNode.isGraphInput) {
              replacer = paramNode.nameAsGraphInput;
            } else {
              replacer = paramNode.getValue().toString();
            }
          } else {
            replacer = oldGenKey;
          }
        }

      }

      str = str.replace(`{{p${index + 1}}}`, replacer);

    })
  }
  currentVar.exp = str;
  return ctx;
}

export class GraphCodeGenerator {
  codeGenGraphNode(node: GraphNode): string {
    const ctx = {
      varList: [{
        varKey: '',
        refedNode: node,
        exp: ''
      }]
    };
    codeGen(ctx);
    console.log(ctx);
    return convertCodeGenContext2Exp(ctx);
  }
}