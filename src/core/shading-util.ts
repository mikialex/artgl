import { ShaderUniformProvider } from "./shading";
import { valueToFlatted } from "./data-type";
import "reflect-metadata";

const UNIFORM_META = 'uniformMetaData';

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
        console.log(info)

        const uniforms = new Map();
        info.uniforms.forEach((uniformName, propertyKey) => { 
          const value = (this as any)[propertyKey]
          const uniformGroup = {
            value,
            uploadCache: valueToFlatted(value),
            isUploadCacheDirty: true,
            blockedBufferStartIndex: 0,
            uniformName: uniformName
          }
          uniforms.set(propertyKey, uniformGroup)
        })

        this.uploadCache = {
          blockedBuffer: null,
          uniforms,
          blockedBufferNeedUpdate: true,
          _version: -1
        }

        constr.prototype.notifyUniformChange = (changedPropertyKey: string, value: any) => {
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

export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, propertyKey: string) => {

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
        (this as any).notifyUniformChange(propertyKey, newValue);
      }
    }
  };
}

export function checkCreate(testValue: any, inputValue: any) {
  if (testValue === undefined) {
    return inputValue
  } else {
    return testValue
  }
}