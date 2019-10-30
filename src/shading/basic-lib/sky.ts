import { BaseEffectShading, Uniform } from "../../core/shading";
import { ShaderGraph, WorldPositionFragVary } from "../../shader-graph/shader-graph";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { Vector3 } from "../../math";
import { Uncharted2Helper } from "../../shader-graph/built-in/tone-mapping";
import { ShadingComponent } from "../../core/shading-decorator";


const rayleighPhase = new ShaderFunction({
  source: `
  float rayleighPhase( float cosTheta ) {

    // 3.0 / ( 16.0 * pi )
    const float THREE_OVER_SIXTEENPI = 0.05968310365946075;

    return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
  }
  `
})

const hgPhase = new ShaderFunction({
  source: `
  float hgPhase( float cosTheta, float g ) {
  	float g2 = pow( g, 2.0 );
    float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
    
    // 1.0 / ( 4.0 * pi )
    const float ONE_OVER_FOURPI = 0.07957747154594767;
  	return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
  }
  `
})

const skyColor = new ShaderFunction({
  dependFunction: [hgPhase, rayleighPhase, Uncharted2Helper],
  source:
    `
    vec4 skyColor(
      vec3 worldPosition,
      vec3 sunDirection,
      float mieDirectionalG,
      float luminance,
      float sunFade
    ){

    const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );

    // constants for atmospheric scattering
    const float pi = 3.141592653589793238462643383279502884197169;

    const float n = 1.0003; // refractive index of air
    const float N = 2.545E25; // number of molecules per unit volume for air at
    // 288.15K and 1013mb (sea level -45 celsius)

    // optical length at zenith for molecules
    const float rayleighZenithLength = 8.4E3;
    const float mieZenithLength = 1.25E3;
    const vec3 up = vec3( 0.0, 1.0, 0.0 );
    // 66 arc seconds -> degrees, and the cosine of that
    const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;


    float zenithAngle = acos( max( 0.0, dot( up, normalize( worldPosition - cameraPos ) ) ) );
    float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
    float sR = rayleighZenithLength * inverse;
    float sM = mieZenithLength * inverse;

    // combined extinction factor
    	vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

    // in scattering
    	float cosTheta = dot( normalize( worldPosition - cameraPos ), sunDirection );

    	float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
    	vec3 betaRTheta = vBetaR * rPhase;

    	float mPhase = hgPhase( cosTheta, mieDirectionalG );
    	vec3 betaMTheta = vBetaM * mPhase;

    	vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
    	Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

    // night sky
    	vec3 direction = normalize( worldPosition - cameraPos );
    	float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
    	float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
    	vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
    	vec3 L0 = vec3( 0.1 ) * Fex;

    // composition + solar disc
    	float sunDisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
      L0 += ( vSunE * 19000.0 * Fex ) * sunDisk;
      
      // tonemap
      const float whiteScale = 1.0748724675633854; // 1.0 / Uncharted2Tonemap(1000.0)

      vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

      vec3 curr = Uncharted2Helper( ( log2( 2.0 / pow( luminance, 4.0 ) ) ) * texColor );
      vec3 color = curr * whiteScale;
    
      vec3 retColor = pow( color, vec3( 1.0 / ( 1.2 + ( 1.2 * sunFade ) ) ) );
    
    	return  vec4( retColor, 1.0 );

    }
  
    `
})

const sunIntensity = new ShaderFunction({
  source: `
  float sunIntensity( vec3 sunDirection ) {
    const vec3 up = vec3( 0.0, 1.0, 0.0 );

    // earth shadow hack
    // cutoffAngle = pi / 1.95;
    const float cutoffAngle = 1.6110731556870734;
    const float steepness = 1.5;
    const float EE = 1000.0;
    const float e = 2.71828182845904523536028747135266249775724709369995957;

    float zenithAngleCos =  dot( sunDirection, up );
  	zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
  	return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
  }
  `
})

const sunFade = new ShaderFunction({
  source: `
  float sunIntensity( vec3 sunPosition) {
    return 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );
  }
  `
})

const BetaR = new ShaderFunction({
  source: `
  vec3 BetaR(
    float rayleigh,
    float sunFade,
  ){
    // this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
    // (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
    const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

    float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - sunFade ) );
    return totalRayleigh * rayleighCoefficient;
  }
  `
})

const BetaM = new ShaderFunction({
  source: `
  vec3 BetaM(
    float turbidity,
    float mieCoefficient,
  ){

    // MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
    const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

    float c = ( 0.2 * turbidity ) * 10E-18;
    vec3 totalMie =  0.434 * c * MieConst;
    return mieCoefficient * totalMie;
  }
  `
})

@ShadingComponent()
export class SkyShading extends BaseEffectShading<SkyShading> {
  constructor() {
    super();
  }

  @Uniform("sunPosition")
  sunPosition = new Vector3(1, 1, 1).normalize() //need normalized

  @Uniform("rayleigh")
  rayleigh = 2

  @Uniform("turbidity")
  turbidity = 10

  @Uniform("mieCoefficient")
  mieCoefficient = 0.005

  @Uniform("luminance")
  luminance = 1

  // luminance = 1

  @Uniform("mieDirectionalG")
  mieDirectionalG = 0.8

  decorate(graph: ShaderGraph): void {
    const sunPosition = this.getPropertyUniform('sunPosition');
    const sunFadeResult = sunFade.make().input("sunPosition", sunPosition);
    graph
      .setVary("vSunDirection", sunPosition)
      .setVary("vSunE", sunIntensity.make().input("sunDirection", sunPosition))
      .setVary("vSunFade", sunFadeResult)
      .setVary("vBetaR",
        BetaR.make()
          .input("rayleigh", this.getPropertyUniform("rayleigh"))
          .input("sunFade", sunFadeResult)
      )
      .setVary("vBetaM",
        BetaM.make()
          .input("turbidity", this.getPropertyUniform("turbidity"))
          .input("mieCoefficient", this.getPropertyUniform("mieCoefficient"))
      )
      .setFragmentRoot(
        skyColor.make()
          .input("worldPosition", graph.getVary(WorldPositionFragVary))
          .input("sunDirection", graph.getVary("vSunDirection"))
          .input("mieDirectionalG", this.getPropertyUniform('mieDirectionalG'))
          .input("luminance", this.getPropertyUniform('luminance'))
          .input("sunFade", graph.getVary("vSunFade"))

      )
  }

}