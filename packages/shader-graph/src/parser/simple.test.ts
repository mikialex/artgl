import { splitStrUntilChar, getOneParam, getParamList, getFuncBody } from "./shader-function-meta";
import { GLDataType } from "@artgl/webgl";


test('split', () => {
  const [h, e] = splitStrUntilChar("asdfas dfsdf {sdfsdf } ", '{')
  expect(h).toBe("asdfas dfsdf ");
  expect(e).toBe("{sdfsdf } ");
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
