import { splitStrUntilChar, getDataType, getOneParam, getParamList, getFuncBody } from "./shader-function-meta";
import { GLDataType } from "../../webgl/shader-util";

test('split', () => {
  const [h, e] = splitStrUntilChar("asdfas dfsdf {sdfsdf } ", '{')
  expect(h).toBe("asdfas dfsdf ");
  expect(e).toBe("{sdfsdf } ");
});

test('get type', () => {
  expect(getDataType("float")).toBe(GLDataType.float);
  expect(getDataType("vec2")).toBe(GLDataType.floatVec2);
  expect(getDataType("vec3")).toBe(GLDataType.floatVec3);
  expect(getDataType("vec4")).toBe(GLDataType.floatVec4);
});

test('get one param', () => {
  expect(getOneParam(" float   depth    ")).toStrictEqual({
    name: "depth",
    type: GLDataType.float
  });
});

test('get params list', () => {
  expect(getParamList("(float depth, vec4 position  )")).toStrictEqual(
    {
      depth: GLDataType.float,
      position: GLDataType.floatVec4
    }
  )
});

test('get body', () => {
  expect(getFuncBody(`
  {float depth, vec4 position  }`))
    .toBe("float depth, vec4 position  ")
});
