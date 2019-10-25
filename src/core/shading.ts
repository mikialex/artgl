
import { generateUUID, ArrayFlattenable } from "../math";
import { Nullable } from "../type";
import { GLProgram } from "../webgl/program/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable, Observer } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { ShaderCommonUniformInputNode } from '../shader-graph/shader-node';
import { uniformFromValue } from '../shader-graph/node-maker';
import { replaceFirst } from '../util/array';
import { GLProgramConfig, uniformUploadType } from "../webgl/interface";
export { MapUniform } from "./shading-util";


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
}

export interface UniformGroup{
  value: UniformValueProvider | number,
  uploadCache: uniformUploadType,
  isUploadCacheDirty: boolean,
}

export interface UniformValueProvider{
  updateUniformUploadData(value: uniformUploadType): uniformUploadType;
  provideUniformUploadData(): uniformUploadType;
}

type propertyName = string;
type uniformName = string;
export interface ShaderUniformProvider {
  uuid: string;

  _version: number;

  // mark the shader need recompile
  uniforms: Map<uniformName, UniformGroup>;
  uniformsByteSizeAll: number;
  propertyUniformNameMap: Map<propertyName, uniformName>;
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
  build() {
    this.graph.reset()
    this._decorators.forEach(decorator => {
      decorator.decorate(this.graph);
    })
  }

  getProgramConfig(isWebGL2?: boolean) {
    if (isWebGL2 === undefined) { // just for debug convenience
      isWebGL2 = true;
    }
    if (this._needRebuildShader) {
      this.build();
      this._programConfigCache = this.graph.compile(isWebGL2);
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