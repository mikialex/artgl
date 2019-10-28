import { ShaderUniformProvider, UniformGroup } from "./shading";
import { ArrayFlattenable } from "../math";

export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, key: string) => {
    if (target.uniforms === undefined) {
      target.uniforms = new Map();
    }
    if (target.propertyUniformNameMap === undefined) {
      target.propertyUniformNameMap = new Map();
    }
    if (target.uniformsSizeAll === undefined) {
      target.uniformsSizeAll = 0;
    }

    let value = undefined!;
    const group: UniformGroup = {
      value,
      blockedBufferStartIndex: 0,
      uploadCache: value,
      isUploadCacheDirty: true,
    }
    target.uniforms.set(remapName, group);
    const getter = () => {
      return group.value;
    };
    const setter = (v: ArrayFlattenable | number) => {
      group.value = v;
      if (group.uploadCache === undefined) {
        if (typeof v !== 'number') {
          group.uploadCache = v.toArray();
          group.blockedBufferStartIndex = target.uniformsSizeAll;
          target.uniformsSizeAll += group.uploadCache.length;
        } else {
          group.uploadCache = v;
          group.blockedBufferStartIndex = target.uniformsSizeAll;
          target.uniformsSizeAll++;
        }
      }
      group.isUploadCacheDirty = true;
      
      target._version++;
      target.blockedBufferNeedUpdate = true;
    };

    target.propertyUniformNameMap.set(key, remapName);

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