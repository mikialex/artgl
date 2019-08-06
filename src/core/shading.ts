
import { generateUUID } from "../math";
import { Nullable } from "../type";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { ShaderCommonUniformInputNode } from '../shader-graph/shader-node';
import { uniformFromValue } from '../shader-graph/node-maker';

export interface ShaderUniformProvider{

  /**
  * impl this to decorate your shader source, add uniform input
  */
  decorate(graph: ShaderGraph): void;

  /**
   * one UniformProvider can have others provider depends and inject, return them in a array
   */
  registerProvider(): ShaderUniformProvider[];

  hasAnyUniformChanged: boolean;
  uniforms: Map<string, any>;
  propertyUniformNameMap: Map<string, string>;
}

export class Shading {
  uuid = generateUUID();
  graph: ShaderGraph = new ShaderGraph();

  programConfigCache: Nullable<GLProgramConfig> = null;
  needRebuildShader: boolean = true;

  // TODO question: how to change provider?
  uniformProvider: ShaderUniformProvider[] = [];
  graphDecorator: ShaderUniformProvider[] = [];

  decorate(decorator: ShaderUniformProvider): Shading {
    const toRegister = decorator.registerProvider();
    toRegister.forEach(provider => {
      this.uniformProvider.push(provider);
    })
    this.graphDecorator.push(decorator);
    return this;
  }

  afterShaderCompiled: Observable<GLProgramConfig> = new Observable();
  build() {
    this.graph.reset()
    this.graphDecorator.forEach(decorator => {
      decorator.decorate(this.graph);
    })
  }

  getProgramConfig() {
  if (this.needRebuildShader) {
      this.build();
    this.programConfigCache = this.graph.compile();
    this.afterShaderCompiled.notifyObservers(this.programConfigCache)
      this.needRebuildShader = false;
    }
    return this.programConfigCache;
  }

  getProgram(engine: RenderEngine): GLProgram {
    if (this.needRebuildShader) {
      this.disposeProgram(engine);
    }
    let program = engine.getProgram(this);
    if (program === undefined) {
      program = engine.createProgram(this);
    }
    return program;
  }

  disposeProgram(engine: RenderEngine): void {
    engine.deleteProgram(this);
  }

}



export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, key: string) => {
    if (target.uniforms === undefined) {
      target.uniforms = new Map();
    }
    if (target.propertyUniformNameMap === undefined) {
      target.propertyUniformNameMap = new Map();
    }

    let val = target[key];
    const getter = () => {
      return val;
    };
    const setter = (value) => {
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

export abstract class BaseEffectShading<T> implements ShaderUniformProvider{
  constructor() {
    // need check if has initialized by decorator
    if (this.uniforms === undefined) {
      this.uniforms = new Map();
    }
    if (this.propertyUniformNameMap === undefined) {
      this.propertyUniformNameMap = new Map();
    }
  }

  abstract decorate(graph: ShaderGraph): void;

  registerProvider(): ShaderUniformProvider[] {
    return [this];
  }

  hasAnyUniformChanged: boolean = true;
  propertyUniformNameMap: Map<string, string>;
  uniforms: Map<string, any>;

  getPropertyUniform(name: keyof T): ShaderCommonUniformInputNode {
    const uniformName = this.propertyUniformNameMap.get(name as string);
    const value = this[name as string];
    if (value === undefined) {
      throw "uniform value not given"
    }
    return uniformFromValue(uniformName, value);
  }
}


// type Constructor<T = SceneNode> = new (...args: any[]) => T;
// type ConstructorTypeOf<T> = new (...args:any[]) => T;

// export function ShaderUniformSceneNodeProvidable<T extends Constructor>(_target: T)
//   : ConstructorTypeOf<SceneNode & BaseEffectShading<T>>
// {
//   return class <K> extends SceneNode implements ShaderUniformProvider{
//     constructor() {
//       super();
//       // need check if has initialized by decorator
//       if (this.uniforms === undefined) {
//         this.uniforms = new Map();
//       }
//       if (this.propertyUniformNameMap === undefined) {
//         this.propertyUniformNameMap = new Map();
//       }
//     }
    
//     decorate(_graph: ShaderGraph): void {
//       throw new Error("Method not implemented.");
//     }

//     hasAnyUniformChanged: boolean;

//     propertyUniformNameMap: Map<string, string>;

//     uniforms: Map<string, any>;

//     getPropertyUniform(name: keyof K): ShaderCommonUniformInputNode {
//       const uniformName = this.propertyUniformNameMap.get(name as string);
//       const value = this[name as string];
//       if (value === undefined) {
//         throw "uniform value not given"
//       }
//       if (typeof value === "number") {
//         return uniform(uniformName, GLDataType.float).default(value);
//       } else if (value instanceof Vector2) {
//         return uniform(uniformName, GLDataType.floatVec2).default(value);
//       } else if (value instanceof Vector3) {
//         return uniform(uniformName, GLDataType.floatVec3).default(value);
//       } else if (value instanceof Vector4) {
//         return uniform(uniformName, GLDataType.floatVec4).default(value);
//       } else if (value instanceof Matrix4) {
//         return uniform(uniformName, GLDataType.Mat4).default(value);
//       } else {
//         throw "un support uniform value"
//       }
//     }
//   };
// }