
import { generateUUID, ArrayFlattenable } from "../math";
import { Nullable } from "../type";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable, Observer } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { ShaderUniformInputNode, ShaderTextureNode } from '../shader-graph/shader-node';
import { uniformFromValue, textureFromValue } from '../shader-graph/node-maker';
import { replaceFirst } from '../util/array';
import { UNIFORM_META, UNIFORM_TEXTURE_META } from "./shading-decorator";
import { Texture, CubeTexture } from "../artgl";
export { Uniform } from "./shading-decorator";
import { UBOProvider, uniformUploadType, GLProgramConfig, GLProgram } from "@artgl/webgl";


export interface ShaderUniformDecorator {
  /**
  * impl this to decorate your shader source, add uniform input
  */
  decorate(graph: ShaderGraph): void;

  /**
   * one UniformProvider can have others provider depends and inject, visit them all
   */
  foreachProvider(visitor: (p: ShaderUniformProvider) => any): void;

  notifyNeedRedecorate: Observable<ShaderUniformDecorator>;
  nodeCreated: Map<string, ShaderUniformInputNode>;
  textureNodeCreated: Map<string, ShaderTextureNode>;
}

export interface UniformGroup{
  value: ArrayFlattenable | number,
  uploadCache: uniformUploadType,
  isUploadCacheDirty: boolean,
  blockedBufferStartIndex: number,
  uniformName: uniformName
}

export interface ProviderUploadCache {
  blockedBuffer: Nullable<Float32Array>;
  uniforms: Map<propertyName, UniformGroup>;
  blockedBufferNeedUpdate: boolean;
  _version: number;
}

type propertyName = string;
type uniformName = string;
export interface ShaderUniformProvider extends UBOProvider{
  shouldProxyedByUBO: boolean;

  uploadCache: ProviderUploadCache;
}


export type ShadingParams = Map<ShaderUniformDecorator, ShaderUniformDecorator>


export class Shading {

  uuid = generateUUID();
  graph = new ShaderGraph();

  _version = 0;

  private _programConfigCache: Nullable<GLProgramConfig> = null;
  private _needRebuildShader: boolean = true;

  _decorators: ShaderUniformDecorator[] = [];
  private _decoratorSlot: Set<ShaderUniformDecorator> = new Set();
  private _namedDecoratorMap: Map<string, ShaderUniformDecorator> = new Map();
  private _decoratorObs: Map<ShaderUniformDecorator, Observer<ShaderUniformDecorator>> = new Map();

  params: ShadingParams = new Map();

  getDecoratorByName(name: string) {
    return this._namedDecoratorMap.get(name)
  }

  updateNewDecorator(oldDecorator: ShaderUniformDecorator, newDecorator: ShaderUniformDecorator) {
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

  replaceDecorator(oldDecorator: ShaderUniformDecorator, newDecorator: ShaderUniformDecorator) {
    // todo check type is same
    if (!this._decoratorSlot.has(oldDecorator)) {
      throw `decorator has not been decorate before`
    }

    if (oldDecorator === newDecorator) {
      return;
    }

    this._decoratorSlot.delete(oldDecorator);
    this._decoratorSlot.add(newDecorator);

    replaceFirst(this._decorators, oldDecorator, newDecorator);
  }

  decoCamera() {
    // this to avoid circle dep
    const { PerspectiveCameraInstance } = require("../camera/perspective-camera");
    this.decorate(PerspectiveCameraInstance)
    return this;
  }

  reset() {
    this._decoratorObs.forEach((obs, dec) => {
      dec.notifyNeedRedecorate.remove(obs);
    })
    this.framebufferTextureMap = {};
    this._decoratorObs.clear();
    this._decoratorSlot.clear();
    this._namedDecoratorMap.clear();
    this._decorators = [];
    this._needRebuildShader = true;
    this._programConfigCache = null;
  }

  decorate(decorator: ShaderUniformDecorator, name?: string): Shading {
    if (this._decoratorSlot.has(decorator)) {
      throw `this decorator has been decorate before`
    }

    if (name !== undefined) {
      if (this._namedDecoratorMap.has(name)) {
        throw `the named <${name}>'s name has been used before`
      }
      this._namedDecoratorMap.set(name, decorator);
    }

    const obs = decorator.notifyNeedRedecorate.add((_deco) => {
      this._version++;
      this._needRebuildShader = true;
    })!
    this._decoratorObs.set(decorator, obs);

    this._decoratorSlot.add(decorator)
    this._decorators.push(decorator);
    return this;
  }

  afterShaderCompiled: Observable<GLProgramConfig> = new Observable();
  private build() {
    this.graph.reset()
    let providerCount = 0;
    const providerIndexMap = new Map<ShaderUniformProvider, number>();
    this._decorators.forEach(decorator => {
      decorator.foreachProvider(p => {
        providerIndexMap.set(p, providerCount);
        providerCount++;
      })
      decorator.decorate(this.graph);
    })
    return providerIndexMap;
  }

  getProgramConfig(isWebGL2?: boolean, useUBO?: boolean) {
    if (isWebGL2 === undefined) { // just for debug convenience
      isWebGL2 = true;
    }
    if (useUBO === undefined) { // just for debug convenience
      useUBO = true;
    }
    if (this._needRebuildShader) {
      const providerIndexMap = this.build();
      this._programConfigCache = this.graph.compile(isWebGL2, useUBO, providerIndexMap);
      this.afterShaderCompiled.notifyObservers(this._programConfigCache)
      this._needRebuildShader = false;
    }
    return this._programConfigCache!;
  }

  getProgram(engine: RenderEngine): GLProgram {
    if (this._needRebuildShader) {
      this.disposeProgram(engine);
    }
    return engine.getProgram(this);
  }

  framebufferTextureMap: { [index: string]: string } = {};
  defineFBOInput(inputFramebufferName: string, uniformName: string): void {
    this.framebufferTextureMap[uniformName] = inputFramebufferName;
  }

  disposeProgram(engine: RenderEngine): void {
    engine.deleteProgram(this);
  }

}


export function MarkNeedRedecorate<T>(_target: any, _propertyKey: any): any {
  const key = Symbol();
  return {
    get(): T {
      return (this as any)[key];
    },
    set(newValue: T) {
      const oldValue = (this as any)[key];
      if (oldValue !== newValue) {
        (this as any).notifyNeedRedecorate.notifyObservers((this as any));
      }
      (this as any)[key] = newValue;
    }
  }
}


export { BaseEffectShading } from './shading-base';

export function getPropertyUniform<T, K extends ShaderUniformDecorator & ShaderUniformProvider>
  (env: K, name: keyof T): ShaderUniformInputNode {
  const uniformNode = env.nodeCreated.get(name as string);
  if (uniformNode !== undefined) {
    return uniformNode;
  }

  const propertyUniformNameMap = Reflect.getMetadata(UNIFORM_META, env).uniforms
  const uniformName = propertyUniformNameMap.get(name as string);

  if (uniformName === undefined) {
    throw `${name} uniform name not found, maybe forget decorator`
  }

  const value = (env as unknown as T)[name];
  if (!checkValue(value)) {
    throw "uniform value not valid, expect array flattenable "
  }
  const node = uniformFromValue(uniformName, value);
  env.nodeCreated.set(name as string, node);
  node.wouldBeProxyedByUBO = env.shouldProxyedByUBO;
  
  return node;
}

export function getPropertyTexture<T, K extends ShaderUniformDecorator & ShaderUniformProvider>
  (env: K, name: keyof T): ShaderTextureNode {
    const textureNode = env.textureNodeCreated.get(name as string);
    if (textureNode !== undefined) {
      return textureNode;
    }
    const propertyUniformTextureNameMap = Reflect.getMetadata(UNIFORM_TEXTURE_META, env).textures
    const textureName = propertyUniformTextureNameMap.get(name as string);
  
    if (textureName === undefined) {
      throw `${name} uniform name not found, maybe forget decorator`
    }
  
    const value = (env as unknown as T)[name];
    if (value === undefined) {
      throw "texture value not given"
    }
    const node = textureFromValue(textureName, value as unknown as Texture | CubeTexture);
    env.textureNodeCreated.set(name as string, node);
    return node;
}

function checkValue(value: any): value is ArrayFlattenable | number {
  if (typeof value === "number") {
    return true;
  }
  return value && value.toArray !== undefined && value.fromArray !== undefined;
}