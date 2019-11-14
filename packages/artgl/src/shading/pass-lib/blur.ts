import { ShaderFunction } from "../../shader-graph/shader-function";


export const blurX = new ShaderFunction({
  source: `
  vec4 blurX( sampler2D textureToBlur, vec2 uv, float s ) {
		vec4 sum = vec4( 0.0 );
		sum += texture2D( textureToBlur, vec2( uv.x - 4.0 * s, uv.y ) ) * 0.051;
		sum += texture2D( textureToBlur, vec2( uv.x - 3.0 * s, uv.y ) ) * 0.0918;
		sum += texture2D( textureToBlur, vec2( uv.x - 2.0 * s, uv.y ) ) * 0.12245;
		sum += texture2D( textureToBlur, vec2( uv.x - 1.0 * s, uv.y ) ) * 0.1531;
		sum += texture2D( textureToBlur, vec2( uv.x, uv.y ) ) * 0.1633;
		sum += texture2D( textureToBlur, vec2( uv.x + 1.0 * s, uv.y ) ) * 0.1531;
		sum += texture2D( textureToBlur, vec2( uv.x + 2.0 * s, uv.y ) ) * 0.12245;
		sum += texture2D( textureToBlur, vec2( uv.x + 3.0 * s, uv.y ) ) * 0.0918;
		sum += texture2D( textureToBlur, vec2( uv.x + 4.0 * s, uv.y ) ) * 0.051;
		return sum * .667;
	}
  `
})


export const blurY = new ShaderFunction({
  source: `
  vec4 blurY( sampler2D textureToBlur, vec2 uv, float s ) {
  	vec4 sum = vec4( 0.0 );
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y - 4.0 * s ) ) * 0.051;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y - 3.0 * s ) ) * 0.0918;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y - 2.0 * s ) ) * 0.12245;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y - 1.0 * s ) ) * 0.1531;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y ) ) * 0.1633;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y + 1.0 * s ) ) * 0.1531;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y + 2.0 * s ) ) * 0.12245;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y + 3.0 * s ) ) * 0.0918;
  	sum += texture2D( textureToBlur, vec2( uv.x, uv.y + 4.0 * s ) ) * 0.051;
  	return sum * .667;
  }
  `
})
