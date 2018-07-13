import { GLDataType } from "./shader-util";

export function findUnifromSetter(type:GLDataType) {
  switch (type) {
    case GLDataType.float: return setValue1f; // FLOAT
    // case 0x8b50: return setValue2fv; // _VEC2
    // case 0x8b51: return setValue3fv; // _VEC3
    // case 0x8b52: return setValue4fv; // _VEC4

    // case 0x8b5a: return setValue2fm; // _MAT2
    // case 0x8b5b: return setValue3fm; // _MAT3
    // case 0x8b5c: return setValue4fm; // _MAT4

    // case 0x8b5e: case 0x8d66: return setValueT1; // SAMPLER_2D, SAMPLER_EXTERNAL_OES
    // case 0x8b60: return setValueT6; // SAMPLER_CUBE

    // case 0x1404: case 0x8b56: return setValue1i; // INT, BOOL
    // case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
    // case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
    // case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
  }
}

function setValue1f(gl, location, v) { gl.uniform1f(location, v) }
function setValue1i(gl, location, v) { gl.uniform1i(location, v) }
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

// Array of matrices (flat or from THREE clases)

// function setValueM2a(gl, v) {
//   gl.uniformMatrix2fv(this.addr, false, flatten(v, this.size, 4));
// }

// function setValueM3a(gl, v) {
//   gl.uniformMatrix3fv(this.addr, false, flatten(v, this.size, 9));
// }

// function setValueM4a(gl, v) {
//   gl.uniformMatrix4fv(this.addr, false, flatten(v, this.size, 16));
// }