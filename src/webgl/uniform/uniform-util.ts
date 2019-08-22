import { GLDataType } from "../shader-util";
import { Matrix4, Vector3 } from "../../math/index";
import { Vector2 } from "../../math/vector2";
import { Vector4 } from "../../math/vector4";
import { flattenerType, copierType, differType } from "./uniform";

export function findUniformSetter(type: GLDataType): any {
  switch (type) {
    case GLDataType.float: return setValue1f;
    case GLDataType.floatVec2: return setValue2fv;
    case GLDataType.floatVec3: return setValue3fv;
    case GLDataType.floatVec4: return setValue4fv;

    case GLDataType.Mat2: return setValue2m;
    case GLDataType.Mat3: return setValue3m;
    case GLDataType.Mat4: return setValue4m;

    // case 0x8b5e: case 0x8d66: return setValueT1; // SAMPLER_2D, SAMPLER_EXTERNAL_OES
    // case 0x8b60: return setValueT6; // SAMPLER_CUBE

    case GLDataType.int: case GLDataType.boolean: return setValue1i; // INT, BOOL
    // case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
    // case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
    // case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
  }
  throw 'uniform setter not found'
}

function setValue1f(gl: WebGLRenderingContext, location: any, v: number) { gl.uniform1f(location, v) }
function setValue2fv(gl: WebGLRenderingContext, location: any, v: Float32Array) { gl.uniform2fv(location, v) }
function setValue3fv(gl: WebGLRenderingContext, location: any, v: Float32Array) { gl.uniform3fv(location, v) }
function setValue4fv(gl: WebGLRenderingContext, location: any, v: Float32Array) { gl.uniform4fv(location, v) }

function setValue1i(gl: WebGLRenderingContext, location: any, v: number) { gl.uniform1i(location, v) }

function setValue2m(gl: WebGLRenderingContext, location: any, v: Float32Array) { gl.uniformMatrix4fv(location, false, v) }
function setValue3m(gl: WebGLRenderingContext, location: any, v: Float32Array) { gl.uniformMatrix4fv(location, false, v) }
function setValue4m(gl: WebGLRenderingContext, location: any, v: Float32Array) { gl.uniformMatrix4fv(location, false, v) }

function differNumber(newVal: number, oldVal: number) {
  return newVal !== oldVal;
}
function differArray(newVal: number[], oldVal: number[]) {
  if (newVal.length !== oldVal.length) {
    return true;
  }
  for (let i = 0; i < newVal.length; i++) {
    if (newVal[i] !== oldVal[i]) {
      return true;
    }
  }
  return false;
}

function copyNumber(newVal: number, _target: number) {
  return newVal;
}

function copyArray(newVal: number[], target: number[]) {
  let targetReal = target;
  if (target === undefined || newVal.length !== target.length) {
    targetReal = [];
  }
  for (let i = 0; i < newVal.length; i++) {
    targetReal[i] = newVal[i]
  }
  return targetReal;
}


export function findUniformDiffer(type: GLDataType): differType {
  if (type === GLDataType.float || type === GLDataType.int) {
    return differNumber as differType
  } else {
    return differArray as differType
  }
}

export function findUniformCopier(type: GLDataType): copierType {
  if (type === GLDataType.float || type === GLDataType.int) {
    return copyNumber as copierType
  } else {
    return copyArray as copierType
  }
}

export function findUniformFlattener(type: GLDataType): flattenerType {
  switch (type) {
    case GLDataType.float: return (v: number) => v;
    case GLDataType.floatVec2: return Vector2.flatten as flattenerType;
    case GLDataType.floatVec3: return Vector3.flatten as flattenerType;
    case GLDataType.floatVec4: return Vector4.flatten as flattenerType;

    case GLDataType.Mat2: throw 'not support yet'; // _MAT2
    case GLDataType.Mat3: throw 'not support yet' // _MAT3
    case GLDataType.Mat4: return Matrix4.flatten as flattenerType // _MAT4

    // case 0x8b5e: case 0x8d66: return setValueT1; // SAMPLER_2D, SAMPLER_EXTERNAL_OES
    // case 0x8b60: return setValueT6; // SAMPLER_CUBE

    // case 0x1404: case 0x8b56: return setValue1i; // INT, BOOL
    // case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
    // case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
    // case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
  }
  throw 'uniform flattener not found'
}

