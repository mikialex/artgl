import { valueToFlatted } from "@artgl/shader-graph/src/data-type";
import { ShaderUniformProvider } from "./interface";
import "reflect-metadata";

export const UNIFORM_META = 'uniformMetaData';
export const UNIFORM_TEXTURE_META = 'uniformTextureMetaData';

export function ShadingComponent() {
  return function _ShadingComponent
    <T extends { new(...args: any[]): ShaderUniformProvider }>
    (constr: T) {
    return class extends constr {
      constructor(...args: any[]) {
        super(...args);

        const info = Reflect.getMetadata(UNIFORM_META, this) as UniformProviderCache
        if (info === undefined) {
          return
        }

        const uniforms = new Map();
        info.uniforms.forEach((uniformName, propertyKey) => { 
          const value = (this as any)[propertyKey]
          const uniformGroup = {
            value, // todo maybe not need this ref, go reflect in useShading
            uploadCache: valueToFlatted(value),
            isUploadCacheDirty: true,
            blockedBufferStartIndex: 0, // this value will get update later in create ubo
            uniformName: uniformName
          }
          uniforms.set(propertyKey, uniformGroup)
        })

        this.uploadCache = {
          blockedBuffer: null,
          uniforms,
          blockedBufferNeedUpdate: true,
          _version: -1
        };

        (this as any).notifyUniformChange = (changedPropertyKey: string, value: any) => {
          const cache = this.uploadCache.uniforms.get(changedPropertyKey)!;
          cache.value = value;
          cache.isUploadCacheDirty = true;
          this.uploadCache.blockedBufferNeedUpdate = true;
          this.uploadCache._version++;
        }

      }
    }
  }
}

interface UniformProviderCache{
  uniforms: Map<string, string>
}

export function Uniform(remapName: string) {
  return (target: ShaderUniformProvider, propertyKey: string): any => {

    // mark metadata;
    let cached: UniformProviderCache = Reflect.getMetadata(UNIFORM_META, target);
    if (cached === undefined) {
      cached = {
        uniforms: new Map()
      }
      Reflect.defineMetadata(UNIFORM_META, cached ,target);
    }
    cached.uniforms.set(propertyKey, remapName);

    // patch getter setter
    const key = Symbol();
    return {
      get() {
        return (this as any)[key];
      },
      set(newValue: any) {
        (this as any)[key] = newValue;
        if ((this as any).notifyUniformChange !== undefined) {
          (this as any).notifyUniformChange(propertyKey, newValue);
        }
      }
    }
  };
}

interface UniformTextureProviderCache{
  textures: Map<string, string>
}

export function Texture(remapName: string) {
  return (target: ShaderUniformProvider, propertyKey: string): any => {

    // mark metadata;
    let cached: UniformTextureProviderCache = Reflect.getMetadata(UNIFORM_TEXTURE_META, target);
    if (cached === undefined) {
      cached = {
        textures: new Map()
      }
      Reflect.defineMetadata(UNIFORM_TEXTURE_META, cached ,target);
    }
    cached.textures.set(propertyKey, remapName);

  };
}

export function checkCreate(testValue: any, inputValue: any) {
  if (testValue === undefined) {
    return inputValue
  } else {
    return testValue
  }
}