
import { generateUUID } from "../math";
import { Nullable } from "../type";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable, Observer } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { ShaderCommonUniformInputNode, ShaderTextureNode } from '../shader-graph/shader-node';
import { uniformFromValue, texture } from '../shader-graph/node-maker';
import { replaceFirst } from '../util/array';
import { Texture } from "./texture";
import { checkCreate } from "./shading-util";

export { MapUniform } from "./shading-util";
export { MapTexture } from "./shading-util";

export interface ShaderUniformDecorator {
  /**
  * impl this to decorate your shader source, add uniform input
  */
  decorate(graph: ShaderGraph): void;

  /**
   * one UniformProvider can have others provider depends and inject, return them in a array
   */
  foreachProvider(visitor: (p: ShaderUniformProvider) => any): void;

  notifyNeedRedecorate: Observable<ShaderUniformDecorator>;
  nodeCreated: Map<string, ShaderCommonUniformInputNode>;
  textureNodeCreated: Map<string, ShaderTextureNode>;
}

type propertyName = string;
type uniformName = string;
type textureShaderName = string;
export interface ShaderUniformProvider {

  // mark any change in this uniform group
  hasAnyUniformChanged: boolean;

  // mark the shader need recompile
  uniforms: Map<uniformName, any>;
  propertyUniformNameMap: Map<propertyName, uniformName>;
  textures: Map<textureShaderName, Texture>;
  propertyTextureNameMap: Map<propertyName, textureShaderName>;
}

export class Shading {
  uuid = generateUUID();
  graph: ShaderGraph = new ShaderGraph();

  private _programConfigCache: Nullable<GLProgramConfig> = null;
  private _needRebuildShader: boolean = true;

  _decorators: ShaderUniformDecorator[] = [];
  private _decoratorSlot: Set<ShaderUniformDecorator> = new Set();
  private _decoratorObs: Map<ShaderUniformDecorator, Observer<ShaderUniformDecorator>> = new Map();

  updateDecorator(oldDecorator: ShaderUniformDecorator, newDecorator: ShaderUniformDecorator) {
    if (!this._decoratorSlot.has(oldDecorator)) {
      throw `decorator has not been decorate before`
    }

    if (oldDecorator === newDecorator) {
      return;
    }

    this._decoratorSlot.delete(oldDecorator);
    this._decoratorSlot.add(newDecorator);

    replaceFirst(this._decorators, oldDecorator, newDecorator);
    this._needRebuildShader = true;
  }

  reset() {
    this._decoratorObs.forEach((obs, dec) => {
      dec.notifyNeedRedecorate.remove(obs);
    })
    this.framebufferTextureMap = {};
    this._decoratorObs.clear();
    this._decoratorSlot.clear();
    this._decorators = [];
    this._needRebuildShader = true;
    this._programConfigCache = null;
  }

  decorate(decorator: ShaderUniformDecorator): Shading {
    if (this._decoratorSlot.has(decorator)) {
      throw `this decorator has been decorate before`
    }

    const obs = decorator.notifyNeedRedecorate.add((_deco) => {
      this._needRebuildShader = true;
    })!
    this._decoratorObs.set(decorator, obs);

    this._decoratorSlot.add(decorator)
    this._decorators.push(decorator);
    return this;
  }

  afterShaderCompiled: Observable<GLProgramConfig> = new Observable();
  build() {
    this.graph.reset()
    this._decorators.forEach(decorator => {
      decorator.decorate(this.graph);
    })
  }

  getProgramConfig() {
    if (this._needRebuildShader) {
      this.build();
      this._programConfigCache = this.graph.compile();
      this.afterShaderCompiled.notifyObservers(this._programConfigCache)
      this._needRebuildShader = false;
    }
    return this._programConfigCache!;
  }

  getProgram(engine: RenderEngine): GLProgram {
    if (this._needRebuildShader) {
      this.disposeProgram(engine);
    }
    let program = engine.getProgram(this);
    if (program === undefined) {
      program = engine.createProgram(this);
    }
    return program;
  }

  framebufferTextureMap: { [index: string]: string } = {};
  defineFBOInput(inputFramebufferName: string, uniformName: string): void {
    this.framebufferTextureMap[uniformName] = inputFramebufferName;
  }

  disposeProgram(engine: RenderEngine): void {
    engine.deleteProgram(this);
  }

}

export function MarkNeedRedecorate() {
  return (target: ShaderUniformDecorator, key: string) => {
    if (target.notifyNeedRedecorate === undefined) {
      target.notifyNeedRedecorate = new Observable();
    }
    let val = (target as any)[key];
    const getter = () => {
      return val;
    };
    const setter = (value: any) => {
      const oldValue = val;
      val = value;
      if (oldValue !== value) {
        target.notifyNeedRedecorate.notifyObservers(target);
      }
    };

    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

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

export function getPropertyTexture<T, K extends ShaderUniformDecorator & ShaderUniformProvider>
  (env: K, name: keyof T): ShaderTextureNode {
  const textureNode = env.textureNodeCreated.get(name as string);
  if (textureNode !== undefined) {
    return textureNode;
  }
  const textureName = env.propertyTextureNameMap.get(name as string);

  if (textureName === undefined) {
    throw `${name} shader texture name not found, maybe forget decorator`
  }

  const value = (env as unknown as T)[name];
  if (value === undefined) {
    throw "texture value not given"
  }
  const node = texture(textureName);
  env.textureNodeCreated.set(name as string, node);
  return node;
}

export function getPropertyUniform<T, K extends ShaderUniformDecorator & ShaderUniformProvider>
  (env: K, name: keyof T): ShaderCommonUniformInputNode {
  const uniformNode = env.nodeCreated.get(name as string);
  if (uniformNode !== undefined) {
    return uniformNode;
  }
  const uniformName = env.propertyUniformNameMap.get(name as string);

  if (uniformName === undefined) {
    throw `${name} uniform name not found, maybe forget decorator`
  }

  const value = (env as unknown as T)[name];
  if (value === undefined) {
    throw "uniform value not given"
  }
  const node = uniformFromValue(uniformName, value);
  env.nodeCreated.set(name as string, node);
  return node;
}