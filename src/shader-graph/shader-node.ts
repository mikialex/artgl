import { DAGNode } from "../core/dag-node";
import { ShaderGraphNodeDefine } from "./shader-graph";
import { ShaderFunction, ShaderFunctionParsedDefine } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, UniformDescriptor, InnerUniformMapDescriptor, InnerUniformMap } from "../webgl/uniform/uniform";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";

export class ShaderNode extends DAGNode {
  constructor() {
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
  constructor(factory: ShaderFunction) {
    super();
    this.factory = factory;
  }

  meaningfulName: string
  factory: ShaderFunction

  /**
   * give this node a meaningful name!
   */
  name(name: string): ShaderFunctionNode {
    this.meaningfulName = name;
    return this;
  }

  /**
   * fill this node a input!
   */
  input(key: string, node: ShaderNode): ShaderFunctionNode {
    if (this.factory.define.inputs[key] === undefined) {
      throw `this shader function node has not a input which key is ${key}`
    }
    this.connectTo(key, node);
    return this;
  }

}


export class ShaderInputNode extends ShaderNode {
  constructor(name: string, dataType: GLDataType) {
    super();
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

