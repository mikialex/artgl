import { Parjs } from '../../../node_modules/parjs/index'; // idont know why
import { GLDataType } from "../../webgl/shader-util";
import { ShaderFunctionParsedDefine, ShaderFunctionDefine } from '../shader-function';

export const floatType = Parjs.string("float").map(_value => GLDataType.float);
export const Vec2Type = Parjs.string("vec2").map(_value => GLDataType.floatVec2);
export const Vec3Type = Parjs.string("vec3").map(_value => GLDataType.floatVec3);
export const Vec4Type = Parjs.string("vec4").map(_value => GLDataType.floatVec4);
export const Mat2Type = Parjs.string("mat2").map(_value => GLDataType.Mat2);
export const Mat3Type = Parjs.string("mat3").map(_value => GLDataType.Mat3);
export const Mat4Type = Parjs.string("mat4").map(_value => GLDataType.Mat4);

export const dataType = floatType.or(Vec2Type).or(Vec3Type).or(Vec4Type).or(Mat2Type).or(Mat3Type).or(Mat4Type)

const extendLetter =  Parjs.letter.or("_")
export const varName = extendLetter.then(Parjs.digit.or(extendLetter).many()).str;

export const oneParam = Parjs.seq(Parjs.whitespaces.q, dataType, Parjs.spaces1.q, varName, Parjs.whitespaces.q).map(
  value => {
    return {
      name: value[1],
      type: value[0]
    }
  }
)

export const paramList = oneParam.manySepBy(",").between("(", ")");
// const paramList = oneParam.manySepBy(",").maybe(Parjs.string(",").q).then(Parjs.whitespaces.q);
// const paramList = Parjs.whitespaces.maybe(oneParam).manySepBy(",")

const functionBody = Parjs.string("{").q.then(Parjs.anyChar.manyTill(Parjs.string("}"))).map(
  value => value.join("")
)

export const functionp = Parjs.seq(
  Parjs.whitespaces.q,
  dataType,
  Parjs.spaces1.q,
  varName,
  Parjs.whitespaces.q,
  paramList,
  Parjs.whitespaces.q,
  functionBody,
  Parjs.whitespaces.q,
);

export function parseShaderFunctionMetaInfo(input: ShaderFunctionDefine): ShaderFunctionParsedDefine {
  try {
    const result = functionp.parse(input.source).value
    return {
      name: result[1],
      description: input.description,
      source: result[3],
      inputs: result[2],
      returnType: result[0],
    }
  } catch (error) {
    throw "shader function parsed error"
  }
}