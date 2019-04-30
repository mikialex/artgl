import { DAGNode } from "../render-graph/dag/dag-node";
import { ShaderGraphNodeDefine } from "./shader-graph";
import { ShaderFunction, ShaderFunctionDefine } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, UniformDescriptor } from "../webgl/uniform/uniform";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";

export class ShaderNode extends DAGNode{
  constructor(public name: string, public dataType: GLDataType) {
    super();
  }
}

/**
 * A node instance of a shaderfunction
 * used in shadergraph for connection
 *
 * @export
 * @class ShaderFunctionNode
 * @extends {DAGNode}
 */
export class ShaderFunctionNode extends ShaderNode{
  constructor(define: ShaderGraphNodeDefine, functionDefine: ShaderFunctionDefine) {
    super(define.name, functionDefine.returnType);
    this.define = define;
  }

  define: ShaderGraphNodeDefine;
  factory: ShaderFunction

  // create a fragmentshader from this node
  makeFragmentShader() {
    
  }

  fillInput(key:string, input) {
    
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
export class ShaderVaryInputNode extends ShaderInputNode {}

export class ShaderInnerUniformInputNode extends ShaderInputNode {
  mapInner: InnerSupportUniform
}

export class ShaderInnerAttributeInputNode extends ShaderInputNode {
  constructor(des: AttributeDescriptor) {
    super(des.name, des.type);
    this.attributeUsage = des.usage;
  }
  attributeUsage: AttributeUsage
}

