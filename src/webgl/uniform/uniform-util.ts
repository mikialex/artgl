import { GLDataType } from "../shader-util";
import { Matrix4, Vector3 } from "../../math/index";
import { Vector2 } from "../../math/vector2";
import { Vector4 } from "../../math/vector4";

export function findUniformSetter(type: GLDataType) {
  switch (type) {
    case GLDataType.float: return setValue1f; // FLOAT
    // case 0x8b50: return setValue2fv; // _VEC2
    // case 0x8b51: return setValue3fv; // _VEC3
    // case 0x8b52: return setValue4fv; // _VEC4

    // case 0x8b5a: return setValue2fm; // _MAT2
    // case 0x8b5b: return setValue3fm; // _MAT3
    case GLDataType.Mat4: return setValueM4a; // _MAT4

    // case 0x8b5e: case 0x8d66: return setValueT1; // SAMPLER_2D, SAMPLER_EXTERNAL_OES
    // case 0x8b60: return setValueT6; // SAMPLER_CUBE

    case GLDataType.int: case GLDataType.boolean: return setValue1i; // INT, BOOL
    // case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
    // case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
    // case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
  }
}

function setValue1f(gl: WebGLRenderingContext, location: any, v: number) { gl.uniform1f(location, v) }
function setValue1i(gl: WebGLRenderingContext, location: any, v: number) { gl.uniform1i(location, v) }
// // Array of vectors 
// function setValueV2a(gl, v) {
//   gl.uniform2fv(this.addr, flatten(v, this.size, 2));
// }

// function setValueV3a(gl, v) {
//   gl.uniform3fv(this.addr, flatten(v, this.size, 3));
// }

// function setValueV4a(gl, v) {
//   gl.uniform4fv(this.addr, flatten(v, this.size, 4));
// }


// function setValueM2a(gl, v) {
//   gl.uniformMatrix2fv(this.addr, false, flatten(v, this.size, 4));
// }

// function setValueM3a(gl, v) {
//   gl.uniformMatrix3fv(this.addr, false, flatten(v, this.size, 9));
// }

function setValueM4a(gl: WebGLRenderingContext, location: any, v: any) { gl.uniformMatrix4fv(location, false, v) }

function differFloat(newVal: number, oldVal: number) {
  return newVal === oldVal;
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

function copyFloat(newVal: number, target: number) {
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


export function findUniformDiffer(type: GLDataType) {
  switch (type) {
    case GLDataType.float: return differFloat; // FLOAT
    case GLDataType.Mat4: return differArray // _MAT4
  }
}

export function findUniformCopyer(type: GLDataType) {
  switch (type) {
    case GLDataType.float: return copyFloat; // FLOAT
    case GLDataType.Mat4: return copyArray // _MAT4
  }
}

export function findUniformFlattener(type: GLDataType) {
  switch (type) {
    case GLDataType.float: return flattenFloat; // FLOAT
    case GLDataType.floatVec2: return Vector2.flatten; // _VEC2
    case GLDataType.floatVec3: return Vector3.flatten; // _VEC3
    case GLDataType.floatVec4: return Vector4.flatten; // _VEC4

    case GLDataType.Mat2: throw 'not support yet'; // _MAT2
    case GLDataType.Mat3: throw 'not support yet' // _MAT3
    case GLDataType.Mat4: return Matrix4.flatten // _MAT4

    // case 0x8b5e: case 0x8d66: return setValueT1; // SAMPLER_2D, SAMPLER_EXTERNAL_OES
    // case 0x8b60: return setValueT6; // SAMPLER_CUBE

    // case 0x1404: case 0x8b56: return setValue1i; // INT, BOOL
    // case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
    // case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
    // case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
  }
  throw 'uniform falttener not found'
}

function flattenFloat(v: number) {
  return v;
}

function flattenVector2(v: Vector2) {

}

function flattenVector3(v: Vector3) {

}

function flattenVector4(v: Vector4) {

}

