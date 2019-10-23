
import { checkCreate } from "./shading-util";
import { Observable } from "./observable";
import {
  ShaderUniformProvider, ShaderUniformDecorator, getPropertyUniform
} from "./shading";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { ShaderCommonUniformInputNode, ShaderTextureNode } from "../shader-graph/shader-node";
import { CubeTexture } from "./texture-cube";
import { Texture, generateUUID } from "../artgl";
import { textureFromValue } from "../shader-graph/node-maker";
import { generateUUIDNoHyphen } from "../math/uuid";

export abstract class BaseEffectShading<T>
  implements ShaderUniformProvider, ShaderUniformDecorator {
  constructor() {
    this.uniforms = checkCreate((this as any).uniforms, new Map());
    this.propertyUniformNameMap = checkCreate((this as any).propertyUniformNameMap, new Map());
    this.notifyNeedRedecorate = checkCreate((this as any).notifyNeedRedecorate, new Observable());
  }

  uuid = generateUUIDNoHyphen();
  abstract decorate(graph: ShaderGraph): void;

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    return visitor(this);
  }

  notifyNeedRedecorate: Observable<ShaderUniformDecorator>

  hasAnyUniformChanged: boolean = true;
  propertyUniformNameMap: Map<string, string>;
  uniforms: Map<string, any>;


  nodeCreated: Map<string, ShaderCommonUniformInputNode> = new Map();
  textureNodeCreated: Map<string, ShaderTextureNode> = new Map();

  getPropertyUniform(name: keyof T): ShaderCommonUniformInputNode {
    return getPropertyUniform(this, name)
  }

  getPropertyTexture(name: keyof T): ShaderTextureNode {
    const textureNode = this.textureNodeCreated.get(name as string);
    if (textureNode !== undefined) {
      return textureNode;
    }
    const textureName = this.propertyUniformNameMap.get(name as string);
  
    if (textureName === undefined) {
      throw `${name} uniform name not found, maybe forget decorator`
    }
  
    const value = (this as unknown as T)[name];
    if (value === undefined) {
      throw "texture value not given"
    }
    const node = textureFromValue(textureName, value as unknown as Texture | CubeTexture);
    this.textureNodeCreated.set(name as string, node);
    return node;
  }

}
