import { ShaderUniformProvider } from "./shading";

export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, key: string) => {
    if (target.uniforms === undefined) {
      target.uniforms = new Map();
    }
    if (target.propertyUniformNameMap === undefined) {
      target.propertyUniformNameMap = new Map();
    }

    let val = (target as any)[key];
    const getter = () => {
      return val;
    };
    const setter = (value: any) => {
      target.uniforms.set(remapName, value);
      target.hasAnyUniformChanged = true;
      val = value;
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

export function MapTexture(remapName: string) {
  return (target: ShaderUniformProvider, key: string) => {
    if (target.textures === undefined) {
      target.textures = new Map();
    }
    if (target.propertyTextureNameMap === undefined) {
      target.propertyTextureNameMap = new Map();
    }

    let val = (target as any)[key];
    const getter = () => {
      return val;
    };
    const setter = (value: any) => {
      target.textures.set(remapName, value);
      val = value;
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