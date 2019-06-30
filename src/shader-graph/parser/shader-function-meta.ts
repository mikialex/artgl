import { Parjs } from '../../../node_modules/parjs/index'; // idont know why
import { GLDataType } from "../../webgl/shader-util";

export const floatType = Parjs.string("float").map(_value => GLDataType.float);
export const Vec2Type = Parjs.string("vec2").map(_value => GLDataType.floatVec2);
export const Vec3Type = Parjs.string("vec3").map(_value => GLDataType.floatVec3);
export const Vec4Type = Parjs.string("vec4").map(_value => GLDataType.floatVec4);

export const dataType = floatType.or(Vec2Type).or(Vec3Type).or(Vec4Type)

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

const functionBody = Parjs.string("{").then(Parjs.anyChar.manyTill(Parjs.string("}")))
export const functionp = Parjs.seq(
  Parjs.whitespaces.q,
  dataType,
  Parjs.spaces1.q,
  varName,
  Parjs.whitespaces.q,
  paramList,
  Parjs.whitespaces.q,
  functionBody.q,
  Parjs.whitespaces.q,
);

