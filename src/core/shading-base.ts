
import { checkCreate } from "./shading-util";
import { Observable } from "./observable";
import {
  ShaderUniformProvider, ShaderUniformDecorator,
  getPropertyUniform, getPropertyTexture
} from "./shading";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { ShaderCommonUniformInputNode, ShaderTextureNode } from "../shader-graph/shader-node";
import { Texture } from "./texture";
type textureShaderName = string;

export abstract class BaseEffectShading<T>
  implements ShaderUniformProvider, ShaderUniformDecorator {
  constructor() {
    this.uniforms = checkCreate((this as any).uniforms, new Map());
    this.textures = checkCreate((this as any).uniforms, new Map());
    this.propertyUniformNameMap = checkCreate((this as any).propertyUniformNameMap, new Map());
    this.propertyTextureNameMap = checkCreate((this as any).propertyUniformNameMap, new Map());
    this.notifyNeedRedecorate = checkCreate((this as any).notifyNeedRedecorate, new Observable());
  }

  abstract decorate(graph: ShaderGraph): void;

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    return visitor(this);
  }

  notifyNeedRedecorate: Observable<ShaderUniformDecorator>

  hasAnyUniformChanged: boolean = true;
  propertyUniformNameMap: Map<string, string>;
  propertyTextureNameMap: Map<string, string>;
  uniforms: Map<string, any>;
  textures: Map<textureShaderName, Texture>;


  nodeCreated: Map<string, ShaderCommonUniformInputNode> = new Map();
  textureNodeCreated: Map<string, ShaderTextureNode> = new Map();

  getPropertyUniform(name: keyof T): ShaderCommonUniformInputNode {
    return getPropertyUniform(this, name)
  }

  getPropertyTexture(name: keyof T): ShaderTextureNode {
    return getPropertyTexture(this, name);
  }

}