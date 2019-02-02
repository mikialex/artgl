```ts
const functionShader = makeShaderFunction({
  name: "integrateBRDFApprox"
  source: `
    const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
    const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
    vec4 r = roughness * c0 + c1;
    float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
    vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
    return specular * AB.x + AB.y;
  `,
  description: "this is a shader function descrption",
  define:{
    returnType: GLDataType: FloatVec3,
    inputs:[
      {
        name: "specular",
        type: FloatVec3
      }
      ...
    ]
  }
})

const functionShader2 = makeShaderFunction({...})

const functionShader3 = makeShaderFunction({...})

functionShader2.pipe(functionShader, "specular")
functionShader3.pipe(functionShader, "aaa")

functionShader.createFragShader();

functionShader2.input(
  functionShader2,
  functionShader2
).next(
  
).next(

)


```