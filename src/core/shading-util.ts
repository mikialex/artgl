import { ShaderUniformProvider, UniformGroup } from "./shading";
import { ArrayFlattenable } from "../math";
import "reflect-metadata";

const CLASS_META = 'classMetaData';
const UNIFORM_META = 'uniformMetaData';

export function ShadingComponent() {
  return function _ShadingComponent<T extends {new(...args: any[]): {}}>(constr: T){
    return class extends constr {
      constructor(...args: any[]) {
        super(...args);

        const info = Reflect.getMetadata(UNIFORM_META, this) as UniformProviderCache
        if (info === undefined) {
          return
        }
        console.log(info)
        info.uniforms.forEach((_uniformName, propertyKey) => { 
          (this as any)[propertyKey] = (this as any)[propertyKey];
        })
      }
    }
  }
}

interface UniformProviderCache{
  uniforms: Map<string, string>
}

export function Uniform(uniformName: string): PropertyDecorator {
  return (target, key) => {
    let cached: UniformProviderCache = Reflect.getMetadata(UNIFORM_META, target);
    if (cached === undefined) {
      cached = {
        uniforms: new Map()
      }
      Reflect.defineMetadata(UNIFORM_META, cached ,target);
    }
    cached.uniforms.set(key as string, uniformName);
  }
}

export function createUniformProviderCache(provider: ShaderUniformProvider) {
  const info = Reflect.getMetadata(UNIFORM_META, provider) as UniformProviderCache
  if (info === undefined) {
    return
  }

  let indexCount = 0;
  const propertyCache = new Map();
  info.uniforms.forEach((uniformName, propertyKey) => {
    const v = (provider as any)[propertyKey];
    if (!v) {
      throw 'value is not valid';
    }
    let uploadCache;
    const blockedBufferStartIndex = indexCount;
    if (typeof v !== 'number') {
      uploadCache = v.toArray();
      indexCount += uploadCache.length;
    } else {
      uploadCache = v;
      indexCount++;
    }
    propertyCache.set(propertyKey, {
      blockedBufferStartIndex,
      uploadCache,
      uniformName
    })
  })
  const blockBuffer = new Float32Array(indexCount);

  return {
    propertyCache,
    blockBuffer,
  }

}

export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, propertyKey: string) => {

    // let cached: UniformProviderCache = Reflect.getMetadata(UNIFORM_META, target);
    // if (cached === undefined) {
    //   cached = {
    //     uniforms: new Map()
    //   }
    //   Reflect.defineMetadata(UNIFORM_META, cached ,target);
    // }
    // cached.uniforms.set(key as string, remapName);



    // if (target.uniforms === undefined) {
    //   target.uniforms = new Map();
    // }
    // if (target.propertyUniformNameMap === undefined) {
    //   target.propertyUniformNameMap = new Map();
    // }
    // if (target.uniformsSizeAll === undefined) {
    //   target.uniformsSizeAll = 0;
    // }
    // if (target._version === undefined) {
    //   target._version = 0;
    // }

    // let value = undefined!;
    // const group: UniformGroup = {
    //   value,
    //   blockedBufferStartIndex: 0,
    //   uploadCache: value,
    //   isUploadCacheDirty: true,
    // }
    // target.uniforms.set(remapName, group);
    // const getter = () => {
    //   return group.value;
    // };
    // const setter = (v: ArrayFlattenable | number) => {
    //   group.value = v;
    //   if (group.uploadCache === undefined) {
    //     if (typeof v !== 'number') {
    //       group.uploadCache = v.toArray();
    //       group.blockedBufferStartIndex = target.uniformsSizeAll;
    //       target.uniformsSizeAll += group.uploadCache.length;
    //     } else {
    //       group.uploadCache = v;
    //       group.blockedBufferStartIndex = target.uniformsSizeAll;
    //       target.uniformsSizeAll++;
    //     }
    //   }
    //   group.isUploadCacheDirty = true;
      
    //   target._version++;
    //   target.blockedBufferNeedUpdate = true;
    // };

    // target.propertyUniformNameMap.set(key, remapName);

    const key = Symbol();

    return {
      get() {
        return (this as any)[key];
      },
      set(newValue: any) {
        (this as any)[key] = newValue;
        (this as any).notifyProjectionChanged();
      }
    }

    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

export function checkCreate(testValue: any, inputValue: any) {
  if (testValue === undefined) {
    return inputValue
  } else {
    return testValue
  }
}