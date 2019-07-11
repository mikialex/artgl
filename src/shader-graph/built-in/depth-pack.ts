import { ShaderFunction } from "../shader-function";

export const depthPack = new ShaderFunction({
  description: 'pack depth to RGBA output',
  source: `
    vec4 depthPack(float frag_depth){
      vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
      vec4 bitMsk = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
      vec4 enc = fract(frag_depth * bitSh);
      enc -= enc.xxyz * bitMsk;
      return enc;
    }
  `,
})

export const unPackDepth = new ShaderFunction({
  description: 'unpack depth from RGBA channel',
  source: `
  float UnpackDepth( vec4 enc ) {
    const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
    return dot( enc, bit_shift );
}`
})