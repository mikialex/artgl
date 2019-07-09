import { DAGNode } from "../core/dag-node";
import { ShaderFunction } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, UniformDescriptor, InnerUniformMapDescriptor, InnerUniformMap } from "../webgl/uniform/uniform";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";

export class ShaderNode extends DAGNode {
  constructor(
    public dataType: GLDataType) {
    super();
  }

  swizzling(part: string) {
    
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
    super(factory.define.returnType);
    this.factory = factory;
  }

  meaningfulName: string
  factory: ShaderFunction
  inputMap: Map<string, ShaderNode> = new Map();

  /**
   * give this node a meaningful name!, this name may show in compiled shader.
   */
  name(name: string): ShaderFunctionNode {
    this.meaningfulName = name;
    return this;
  }

  /**
   * fill this node a input!
   */
  input(key: string, node: ShaderNode): ShaderFunctionNode {
    const dataType = this.factory.define.inputs[key]
    if (dataType === undefined) {
      throw `this shader function node has not a input which key is ${key}`
    }
    if (dataType !== node.dataType) {
          console.warn("node:", this);
          console.warn("inputNode:", node);
          throw "constructFragmentGraph failed: type mismatch"
    }
    this.connectTo(node);
    this.inputMap.set(key, node);
    return this;
  }

}


export class ShaderInputNode extends ShaderNode {
  constructor(name: string, dataType: GLDataType) {
    super(dataType);
    this.name = name;
    this.dataType = dataType;
  }
  name: string;
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

export class ShaderTextureInputNode extends ShaderInputNode {
  constructor(des) {
    super(des.name, des.type);
  }

  fetch(node: ShaderNode): ShaderTextureFetchNode {
    return new ShaderTextureFetchNode();
  }
}

export class ShaderTextureFetchNode extends ShaderNode {
  constructor(source: ShaderTextureInputNode, ) {
    super(des.name, des.type);
  }


}


export class ShaderDataWrapNode extends ShaderNode {
  constructor(source: ShaderTextureInputNode, ) {
    super(des.name, des.type);
  }


}