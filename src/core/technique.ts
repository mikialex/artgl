import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage } from "../webgl/attribute";
import { ARTEngine } from "../engine/render-engine";

export const standradMeshAttributeLayout = [
  { name:'position',type:GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
  { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal, stride: 3 },
  { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
]

export interface TechniqueConfig{
  programConfig: GLProgramConfig;
}

/**
 * mateiral defined how to draw a things
 * typically, one mateiral is corespondent to a gl program
 *  program's shader and infos are defined in technique config
 * technique config is wrap a program condig
 * that the engine will use this to tell underlayer gl renderer
 * to create and compiled shader.
 * @export
 * @class Technique
 */
export class Technique{
  constructor(config: TechniqueConfig) {
    // setup default uniform value
    this.config = config;
    this.config.programConfig.uniforms.forEach(uniform => {
      if (uniform.name !== 'MMatrix' && uniform.name !== 'VPMatrix') {
        this.uniforms[uniform.name] = uniform.default;
      }
    })
  }

  config: TechniqueConfig;
  name: string;
  uuid: string = generateUUID();
  programId: string;

  needUpdate = true;
  isTransparent = false;

  uniforms: Map<string, any> = new Map();


  getProgram(engine: ARTEngine): GLProgram {
    if (this.needUpdate) {
      engine.createProgram(this);
    }
    return engine.getProgram(this);
  }

  dispose(engine: ARTEngine): void {
    const program = this.getProgram(engine);
    if (program) {
      program.dispose();
    }
  }

  // blending = NormalBlending;
  // side = FrontSide;
  // shading = SmoothShading; // THREE.FlatShading, THREE.SmoothShading
  // vertexColors = NoColors; // THREE.NoColors, THREE.VertexColors, THREE.FaceColors

  // opacity = 1;
  // transparent = false;

  // blendSrc = SrcAlphaFactor;
  // blendDst = OneMinusSrcAlphaFactor;
  // blendEquation = AddEquation;
  // blendSrcAlpha = null;
  // blendDstAlpha = null;
  // blendEquationAlpha = null;

  // depthFunc = LessEqualDepth;
  // depthTest = true;
  // depthWrite = true;

  // clippingPlanes = null;
  // clipIntersection = false;
  // clipShadows = false;

  // colorWrite = true;

  // polygonOffset = false;
  // polygonOffsetFactor = 0;
  // polygonOffsetUnits = 0;

  // dithering = false;

  // alphaTest = 0;
  // premultipliedAlpha = false;

  // needsUpdate = true;

}