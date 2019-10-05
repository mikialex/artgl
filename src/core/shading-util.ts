import { ShaderUniformProvider } from "./shading";

import "reflect-metadata";

// const formatMetadataKey = Symbol("uniformMap");

// function format(formatString: string) {
//     return Reflect.metadata(formatMetadataKey, formatString);
// }

// function getFormat(target: any, propertyKey: string) {
//     return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
// }

// function ParamTypes(...types) {
//   return (target, propertyKey) => {
//     const symParamTypes = Symbol.for("design:paramtypes");
//     if (propertyKey === undefined) {
//       target[symParamTypes] = types;
//     }
//     else {
//       const symProperties = Symbol.for("design:properties");
//       let properties, property;
//       if (Object.prototype.hasOwnProperty.call(target, symProperties)) {
//         properties = target[symProperties];
//       }
//       else {
//         properties = target[symProperties] = {};
//       }
//       if (Object.prototype.hasOwnProperty.call(properties, propertyKey)) {
//         property = properties[propertyKey];
//       }
//       else {
//         property = properties[propertyKey] = {};
//       }
//       property[symParamTypes] = types;
//     }
//   };
// }



export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, key: string) => {
    // if (Object.getOwnPropertyDescriptor(target, 'uniforms') == null) {
    //   return;
    // }
    // if (Object.getOwnPropertyDescriptor(target, 'propertyUniformNameMap') == null) {
    //   return;
    // }
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

export function checkCreate(testValue: any, inputValue: any) {
  if (testValue === undefined) {
    return inputValue
  } else {
    return testValue
  }
}