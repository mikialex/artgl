import { BaseEffectShading, MapUniform } from "../../core/shading";
import { ShaderGraph } from "../../shader-graph/shader-graph";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { Vector3 } from "../../math";

  
const rayleighPhase = new ShaderFunction({
  source: `
  float rayleighPhase( float cosTheta ) {
    return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
  }

  `
})

const hgPhase = new ShaderFunction({
  source: `
  float hgPhase( float cosTheta, float g ) {
  	float g2 = pow( g, 2.0 );
  	float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
  	return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
  }

  `
})

const skyColor = new ShaderFunction({
  dependFunction: [hgPhase, rayleighPhase],
  source:
    `
    vec4 skyColor(
      vec3 worldPosition,
      vec3 cameraPos,
      vec3 sunDirection,
      float mieZenithLength,
      float rayleighZenithLength,
      float mieDirectionalG,
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

    // 3.0 / ( 16.0 * pi )
    const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
    // 1.0 / ( 4.0 * pi )
    const float ONE_OVER_FOURPI = 0.07957747154594767;


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

    	return ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

    }
  
    `
})

const t = new ShaderFunction({
  source: 
    `
    vec3 totalMie( float T ) {
    	float c = ( 0.2 * T ) * 10E-18;
    	return 0.434 * c * MieConst;
    }
    `
})


const sunIntensity = new ShaderFunction({
  source: `

  float sunIntensity( vec3 sunDirection, vec3 up ) {
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


export class SkyShading extends BaseEffectShading<SkyShading> {
  constructor() {
    super();
  }

  sunPosition = new Vector3(1,1,1).normalize() //need normalized

  decorate(graph: ShaderGraph): void {
    const sunPosition = this.getPropertyUniform('sunPosition');

    graph
      .setVary("vSunDirection", sunPosition)
      .setVary("vSunE", sunIntensity.make())
      .setVary("vSunFade",
        sunFade.make().input("sunPosition", sunPosition)
      )
      .setFragmentRoot(
        skyColor.make()
      )
  }


  @MapUniform("shininess")
  shininess: number = 15;

}