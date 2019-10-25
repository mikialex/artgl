import { ShaderUniformProvider, UniformValueProvider, UniformGroup } from "./shading";

export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, key: string) => {
    if (target.uniforms === undefined) {
      target.uniforms = new Map();
    }
    if (target.propertyUniformNameMap === undefined) {
      target.propertyUniformNameMap = new Map();
    }

    let value =  (target as any)[key]
    const group: UniformGroup = {
      value,
      uploadCache: value.provideUniformUploadData(),
      isUploadCacheDirty: true,
    }
    const getter = () => {
      return group.value;
    };
    const setter = (v: UniformValueProvider) => {
      group.value = v;
      group.isUploadCacheDirty = true;
      target._version++;
      value = v;
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