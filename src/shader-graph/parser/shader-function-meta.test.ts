import { dataType, oneParam, paramList, functionp, varName } from "./shader-function-meta";
import { GLDataType } from "../../webgl/shader-util";


test('type parser', () => {
  expect(dataType.parse("float").value).toBe(GLDataType.float);
  expect(dataType.parse("vec2").value).toBe(GLDataType.floatVec2);
  expect(dataType.parse("vec3").value).toBe(GLDataType.floatVec3);
  expect(dataType.parse("vec4").value).toBe(GLDataType.floatVec4);
});

test('var name parser', () => {
  expect(varName.parse("sdfkm").value).toBe("sdfkm");
  expect(varName.parse("sdfkm2").value).toBe("sdfkm2");
});


test('param parser', () => {
  expect(oneParam.parse("float depth").value).toStrictEqual({
    name: "depth",
    type: GLDataType.float
  });

  expect(oneParam.parse(" float   depth    ").value).toStrictEqual({
    name: "depth",
    type: GLDataType.float
  });
});

test('param list parser', () => {
  expect(paramList.parse("(float depth, vec4 position)").value).toStrictEqual(
    [
      {
        name: "depth",
        type: GLDataType.float
      },
      {
        name: "position",
        type: GLDataType.floatVec4
      },
    ]
  );

  // todo
  // expect(paramList.parse("( float   depth   ,   vec4 position  , )").value).toStrictEqual(
  //   [
  //     {
  //       name: "depth",
  //       type: GLDataType.float
  //     },
  //     {
  //       name: "position",
  //       type: GLDataType.floatVec4
  //     },
  //   ]
  // );

});

test('function parser', () => {
  expect(functionp.parse( 
    `
    vec4 depth_pack (float frag_depth) {
      vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
      vec4 bitMsk = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
      vec4 enc = fract(frag_depth * bitSh);
      enc -= enc.xxyz * bitMsk;
      return enc; 
    }
    `
  ).value).toStrictEqual(
    [
      GLDataType.floatVec4,
      "depth_pack",
      [
        {
          name: "frag_depth",
          type: GLDataType.float
        }
      ]
    ]
  );
  
});