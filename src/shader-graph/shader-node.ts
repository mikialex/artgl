import { DAGNode } from "../core/dag-node";
import { ShaderFunction } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import {
  InnerSupportUniform, UniformDescriptor,
  InnerUniformMapDescriptor, InnerUniformMap
} from "../webgl/uniform/uniform";
import { AttributeDescriptor } from "../webgl/attribute";
import { Vector2 } from "../math/vector2";
import { Vector3 } from "../math/index";
import { Vector4 } from "../math/vector4";
import { GLTextureType } from "../webgl/uniform/uniform-texture";

export class ShaderNode extends DAGNode {
  constructor(
    public type: GLDataType
  ) {
    super();
  }

  swizzling(swizzleType: string) {
    return new ShaderSwizzleNode(this, swizzleType);
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
    if (dataType !== node.type) {
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

  defaultValue: any;

  default(value: any): ShaderCommonUniformInputNode {
    this.defaultValue = value;
    return this;
  }
}

export class ShaderVaryInputNode extends ShaderInputNode {
  constructor(name: string, type: GLDataType) {
    super(name, type);
  }
}

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
  }

  isInstance: boolean;
  makeInstance() {
    this.isInstance = true;
    return this;
  }
}

// castValidFloat
function svf(value: number) {
  let str = value + "";
  if (str.indexOf(".") === -1) {
    str = str + ".0"
  }
  return str
}

export type ShaderConstType = number | Vector2 | Vector3 | Vector4;

export class ShaderConstNode extends ShaderNode {
  constructor(value: ShaderConstType) {
    if (typeof value === "number") {
      super(GLDataType.float)
      this.shaderString = svf(value);
    } else if (value instanceof Vector2) {
      super(GLDataType.floatVec2)
      this.shaderString = `vec2(${svf(value.x)}, ${svf(value.y)})`;
    } else if (value instanceof Vector3) {
      super(GLDataType.floatVec3)
      this.shaderString = `vec2(${svf(value.x)}, ${svf(value.y)}, ${svf(value.z)})`;
    } else if (value instanceof Vector4) {
      super(GLDataType.floatVec4)
      this.shaderString = `vec4(${svf(value.x)}, ${svf(value.y)}, ${svf(value.z)}, ${svf(value.w)})`;
    } else {
      throw "un support shader const node value"
    }
    this.value = value;
  }
  value: ShaderConstType
  shaderString: string;
}

export class ShaderTextureNode extends ShaderInputNode {
  constructor(
    public name: string,
    public type: GLDataType,
    public textureType: GLTextureType
  ) {
    super(name, type);
  }

  fetch(node: ShaderNode): ShaderTextureFetchNode {
    return new ShaderTextureFetchNode(this, node);
  }
}

export class ShaderTextureFetchNode extends ShaderNode {
  constructor(
    public source: ShaderTextureNode,
    public fetchByNode: ShaderNode
  ) {
    super(fetchByNode.type);
    source.connectTo(this);
    fetchByNode.connectTo(this);
    this.type = GLDataType.floatVec4
  }
}

function getValueCount(type: GLDataType) {
  switch (type) {
    case GLDataType.float:
      return 1
    case GLDataType.floatVec2:
      return 2
    case GLDataType.floatVec3:
      return 3
    case GLDataType.floatVec4:
      return 4
    default:
      throw "not support combine type"
  }
}

export class ShaderCombineNode extends ShaderNode {
  constructor(combines: ShaderNode[], type: GLDataType) {
    super(type);
    let count = 0;
    combines.forEach(node => {
      count += getValueCount(node.type)
    })
    if (count !== getValueCount(type)) {
      throw 'combine node input not satisfied'
    }
    this.combineCount = count;
    this.combines = combines;
    this.combines.forEach(node => {
      node.connectTo(this);
    })
  }

  combines: ShaderNode[];
  combineCount: number;


}

function length2Type(value: string) {
  switch (value.length) {
    case 1: return GLDataType.float
    case 2: return GLDataType.floatVec2
    case 3: return GLDataType.floatVec3
    case 4: return GLDataType.floatVec4
    default: throw "error"
  }
}

export class ShaderSwizzleNode extends ShaderNode {
  constructor(node: ShaderNode, swizzleType: string) {
    super(node.type);

    const swizzledSourceCount = getValueCount(node.type)

    const parts = swizzleType.trim().split("");
    if (parts.length > 4) {
      // TODO check more
      throw "swizzle not valid"
    }

    if (parts.length > swizzledSourceCount) {
      throw "swizzle not valid, swizzle part exceed swizzledSource"
    }

    this.from = node;
    node.connectTo(this);
    this.swizzleType = swizzleType
    this.type = length2Type(swizzleType)
  }
  swizzleType: string = "";
  from: ShaderNode;

}