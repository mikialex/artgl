import { Parjs } from '../../../node_modules/parjs/index'; // idont know why

const floatType = Parjs.string("float");
const Vec2Type = Parjs.string("vec2");
const Vec3Type = Parjs.string("vec3");
const Vec4Type = Parjs.string("vec4");

const dataType = floatType.or(Vec2Type).or(Vec3Type).or(Vec4Type)

const varName = Parjs.letter.then(Parjs.digit.or(Parjs.letter).many()).str;

const oneParam = Parjs.seq(Parjs.space, dataType, Parjs.spaces1, varName, Parjs.space, );

const paramList = oneParam.manySepBy(",");

const functionHead = Parjs.seq(Parjs.space, dataType, Parjs.spaces1, varName, Parjs.space, paramList, Parjs.space);

const functionBody = Parjs.anyChar.many().between("{", "}")

const functionp = functionHead.then(functionBody)

export function parseGLSLFunctionMeta(shaderString: string) {
  
}