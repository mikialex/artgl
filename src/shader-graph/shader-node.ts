import { DAGNode } from "../core/dag-node";
import { ShaderFunction } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, UniformDescriptor, InnerUniformMapDescriptor, InnerUniformMap } from "../webgl/uniform/uniform";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";
import { Vector2 } from "../math/vector2";
import { Vector3 } from "../math/index";
import { Vector4 } from "../math/vector4";

export class ShaderNode extends DAGNode {
  constructor(
    public type: GLDataType
  ) {
    super();
  }

  enableSwizzle: boolean = false;
  swizzleType: string[] = [];

  get returnType(): GLDataType {
    if (this.enableSwizzle) {
      switch (this.swizzleType.length) {
        case 1: return GLDataType.float
        case 2: return GLDataType.floatVec2
        case 3: return GLDataType.floatVec3
        case 4: return GLDataType.floatVec4
        default: throw "error"
      }
    } else {
      return this.type
    }
  }

  swizzling(swizzleType: string) {
    const parts = swizzleType.trim().split("");
    if (parts.length > 4) {
      throw "swizzle not valid"
    }
    this.swizzleType = parts;
    this.enableSwizzle = true;
    return this;
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
    if (dataType !== node.returnType) {
      console.warn("node:", this);
      console.warn("inputNode:", node);
      throw "constructFragmentGraph failed: type mismatch"
    }
    node.connectTo(this);
    this.inputMap.set(key, node);
    return this;
  }

}


export class ShaderInputNode extends ShaderNode {
  constructor(name: string, type: GLDataType) {
    super(type);
    this.name = name;
    this.type = type;
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

export type ShaderConstType = number | Vector2 | Vector3 | Vector4;
export class ShaderConstNode extends ShaderNode {
  constructor(value: ShaderConstType) {
    if (typeof value === "number") {
      super(GLDataType.float)
    } else if (value instanceof Vector2) {
      super(GLDataType.floatVec2)
    } else if (value instanceof Vector3) {
      super(GLDataType.floatVec3)
    } else if (value instanceof Vector4) {
      super(GLDataType.floatVec4)
    } else {

    }
    this.value = value;
  }
  value: ShaderConstType
}

export class ShaderTexture {
  constructor(
    public name: string,
    public type: GLDataType
  ) {
  }

  fetch(node: ShaderNode): ShaderTextureFetchNode {
    return new ShaderTextureFetchNode(this).sample(node);
  }
}

export class ShaderTextureFetchNode extends ShaderNode {
  constructor(
    public source: ShaderTexture,
  ) {
    super(source.type);
  }

  fetchByNode: ShaderNode;

  sample(node: ShaderNode) {
    this.fetchByNode = node;
    node.connectTo(this);
    return this;
  }
}


export class ShaderCombineNode extends ShaderNode {
  constructor(combines: ShaderNode[], type: GLDataType) {
    // TODO
    super(type);
  }

  combines: ShaderNode[];
}

export class ShaderSwizzleNode extends ShaderNode {
  constructor(node: ShaderNode) {
    super(node.type);
    this.connectTo(node);
  }

}