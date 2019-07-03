import { DAGNode } from "../core/dag-node";
import { ShaderGraphNodeDefine } from "./shader-graph";
import { ShaderFunction, ShaderFunctionParsedDefine } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, UniformDescriptor, InnerUniformMapDescriptor, InnerUniformMap } from "../webgl/uniform/uniform";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";

export class ShaderNode extends DAGNode {
  constructor(public name: string, public dataType: GLDataType) {
    super();
  }
}

/**
 * A node instance of a shader function
 * used in shadergraph for connection
 *
 * @export
 * @class ShaderFunctionNode
 * @extends {DAGNode}
 */
export class ShaderFunctionNode extends ShaderNode {
  constructor(define: ShaderGraphNodeDefine, functionDefine: ShaderFunctionParsedDefine) {
    super(define.name, functionDefine.returnType);
    this.define = define;
  }

  define: ShaderGraphNodeDefine;
  factory: ShaderFunction

  // create a fragment shader from this node
  makeFragmentShader() {

  }

  fillInput(key: string, input) {

  }
}


export class ShaderInputNode extends ShaderNode {
  constructor(name: string, dataType: GLDataType) {
    super(name, dataType);
  }
}

export class ShaderCommonUniformInputNode extends ShaderInputNode {
  constructor(des: UniformDescriptor) {
    super(des.name, des.type);
  }
}
export class ShaderVaryInputNode extends ShaderInputNode { }

export class ShaderInnerUniformInputNode extends ShaderInputNode {
  constructor(uni: InnerUniformMapDescriptor) {
    super(uni.name, InnerUniformMap.get(uni.mapInner).type)
    this.mapInner = uni.mapInner;
  }
  mapInner: InnerSupportUniform
}

export class ShaderAttributeInputNode extends ShaderInputNode {
  constructor(des: AttributeDescriptor) {
    super(des.name, des.type);
    this.attributeUsage = des.usage;
  }
  attributeUsage: AttributeUsage
}

