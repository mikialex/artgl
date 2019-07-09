import { GLRenderer } from "../webgl/gl-renderer";
import { RenderObject, RenderRange } from "../core/render-object";
import { Camera } from "../core/camera";
import { Matrix4 } from "../math/matrix4";
import { GLProgram } from "../webgl/program";
import { Geometry } from "../core/geometry";
import { BufferData } from "../core/buffer-data";
import { Technique } from "../core/technique";
import { DrawMode } from "../webgl/const";
import { Texture } from "../core/texture";
import { Material } from "../core/material";
import { GLTextureUniform } from "../webgl/uniform/uniform-texture";
import { PerspectiveCamera } from "../camera/perspective-camera";
import { Nullable, GLReleasable } from "../type";
import { InnerSupportUniform, InnerUniformMap } from "../webgl/uniform/uniform";
import { UniformProxy } from "./uniform-proxy";
import { Observable } from "../core/observable";
import { GLFramebuffer } from '../webgl/gl-framebuffer';
import { QuadSource } from '../render-graph/quad-source';
import { CopyTechnique } from '../technique/technique-lib/copy-technique';
import { downloadCanvasPNGImage } from "../util/file-io";
import { NormalTechnique } from "../technique/technique-lib/normal-technique";

export interface RenderSource{
  resetSource(): void;
  nextRenderable(): Nullable<RenderObject>;
  updateSource(): void;
}

export function foreachRenderableInSource(source: RenderSource, visitor: (obj: RenderObject) => any) {
  source.updateSource();
  source.resetSource();
  let nextSource: RenderObject | null = null;
  do {
    nextSource = source.nextRenderable();
    if (nextSource !== null) {
      visitor(nextSource);
    }
  } while (nextSource !== null);
}

export interface Size{
  width: number;
  height: number;
}


const copyTechnique = new CopyTechnique();
const quad = new QuadSource();

export class ARTEngine implements GLReleasable{
  constructor(el?: HTMLCanvasElement, ctxOptions?: any) {
    this.renderer = new GLRenderer(el, ctxOptions);
    // if we have a element param, use it as the default camera's param for convenience
    if (el !== undefined) {
      (this.camera as PerspectiveCamera).aspect = el.width / el.height;
    }

    InnerUniformMap.forEach((des, key) => {
      this.globalUniforms.set(key, new UniformProxy(des.default))
    })
    
    this.preferVAO = true;
  }

  readonly renderer: GLRenderer;
  _preferVAO: boolean = true;
  _vaoEnabled: boolean = false;
  get vaoEnabled(): boolean { return this._vaoEnabled };
  get preferVAO(): boolean { return this._preferVAO };
  set preferVAO(val: boolean) {
    this._preferVAO = val;
    if (val) {
      if (!this.renderer.vaoManager.isSupported) {
        console.warn(`prefer vao is set to true, but your environment cant support vao, vaoEnabled is false`)
      }
      this._vaoEnabled = true
    } else {
      this.renderer.vaoManager.releaseGL();
      this._vaoEnabled = false
    }
  }

  // resize
  readonly resizeObservable: Observable<Size> = new Observable<Size>();
  setSize(width:number, height: number) {
    if (this.renderer.setSize(width, height)) {
      this.resizeObservable.notifyObservers({
        width, height
      })
    }
  }
  setActualSize(width: number, height: number) {
    if (this.renderer.setRawRenderSize(width, height)) {
      this.resizeObservable.notifyObservers({
        width, height
      })
    }
  }


  public overrideTechnique: Nullable<Technique> = null;
  public defaultTechnique: Technique = new NormalTechnique();

  ////




  //// camera related
  _camera: Camera = new PerspectiveCamera();
  public isCameraChanged = true;
  get camera() { return this._camera };
  set camera(camera) {
    this._camera = camera;
    this.isCameraChanged = true;
  };
  private cameraMatrixReverse = new Matrix4();
  private ProjectionMatrix = new Matrix4();
  private VPMatrix = new Matrix4();
  private LastVPMatrix = new Matrix4();

  private jitterPMatrix = new Matrix4();
  private jitterVPMatrix = new Matrix4();

  jitterProjectionMatrix() {
    this.jitterPMatrix.copy(this.ProjectionMatrix);
    this.jitterPMatrix.elements[8] += ((2 * Math.random() - 1) / this.renderer.width);
    this.jitterPMatrix.elements[9] += ((2 * Math.random() - 1) / this.renderer.height);
    this.jitterVPMatrix.multiplyMatrices(this.jitterPMatrix, this.cameraMatrixReverse);
    this.getGlobalUniform(InnerSupportUniform.VPMatrix).setValue(this.jitterVPMatrix);
  }

  unJit() {
    this.getGlobalUniform(InnerSupportUniform.VPMatrix).setValue(this.VPMatrix);
  }

  /**
   * call this to update engine layer camera related render info
   * such as matrix global uniform.
   *
   * @memberof ARTEngine
   */
  connectCamera() {
    let needUpdateVP = false;
    // 
    if (this.camera.projectionMatrixNeedUpdate) {
      this.camera.updateProjectionMatrix();
      this.ProjectionMatrix.copy(this.camera.projectionMatrix);
      needUpdateVP = true;
    }
    if (this.camera.transform.transformFrameChanged) {
      this.camera.transform.matrix;
      this.camera.updateWorldMatrix(true);
      this.cameraMatrixReverse.getInverse(this.camera.worldMatrix, true);
      needUpdateVP = true;
    }

    this.LastVPMatrix.copy(this.VPMatrix);
    this.getGlobalUniform(InnerSupportUniform.LastVPMatrix).setValue(this.LastVPMatrix);

    if (needUpdateVP) {
      this.VPMatrix.multiplyMatrices(this.ProjectionMatrix, this.cameraMatrixReverse);
      this.getGlobalUniform(InnerSupportUniform.VPMatrix).setValue(this.VPMatrix);
      needUpdateVP = false;
      this.isCameraChanged = true;
    } else {
      this.isCameraChanged = false;
    }
   
  }
  ////




  //// render APIs
  // render renderList from given source
  render(source: RenderSource) {
    foreachRenderableInSource(source, (obj) => {
      this.renderObject(obj);
    })
  }

  renderObjects(objects: RenderObject[]) {
    for (let i = 0; i < objects.length; i++) {
      this.renderObject(objects[i]);
    }
  }

  renderObject(object: RenderObject) {

    // prepare technique
    const program = this.connectTechnique(object);

    // prepare material
    this.connectMaterial(object.material, program);

    // prepare geometry
    this.connectGeometry(object.geometry, program);

    this.connectRange(object.range, program, object.geometry)

    // render
    this.renderer.render(DrawMode.TRIANGLES, program.useIndexDraw);
  }

  renderDebugFrameBuffer(framebuffer: GLFramebuffer) {
    this.renderer.setRenderTargetScreen();
    const debugViewPort = framebuffer.debuggingViewport;
    this.renderer.state.setViewport(
      debugViewPort.x, debugViewPort.y,
      debugViewPort.z, debugViewPort.w
    );

    this.overrideTechnique = copyTechnique;
    this.overrideTechnique.getProgram(this).defineFrameBufferTextureDep(
      framebuffer.name, 'copySource'
    );
    this.render(quad);
    this.overrideTechnique = null;
  }
  ////




  //// low level resource binding

  /**
   *
   * GlobalUniforms is store useful inner support uniforms
   * Engine will update these values and auto bind them to
   * program that you will draw as needed
   *
   * @private
   * @type {Map<InnerSupportUniform, UniformProxy>}
   * @memberof ARTEngine
   */
  private globalUniforms: Map<InnerSupportUniform, UniformProxy> = new Map();
  getGlobalUniform(uniform: InnerSupportUniform): UniformProxy {
    return this.globalUniforms.get(uniform) as UniformProxy 
  }
  private connectTechnique(object: RenderObject): GLProgram {
    let technique: Technique;
    if (this.overrideTechnique !== null) {
      technique = this.overrideTechnique;
    } else if (object.technique !== undefined) {
      technique = object.technique;
    } else {
      technique = this.defaultTechnique;
    }
    const program = technique.getProgram(this);
    this.renderer.useProgram(program);
    this.getGlobalUniform(InnerSupportUniform.MMatrix).setValue(object.worldMatrix);
    program.updateInnerGlobalUniforms(this); // TODO maybe minor optimize here
    technique.uniforms.forEach((uni, key) => {
      // if (uni._needUpdate) {
        program.setUniform(key, uni.value);
        uni.resetUpdate();
      // }
    })
    return program;
  }

  private connectMaterial(material: Material, program: GLProgram) {

    program.forTextures((tex: GLTextureUniform) => {
      let glTexture: WebGLTexture | undefined;

      // acquire texture from material or framebuffer
      if (material !== undefined) {
        if (tex.channel === undefined) {
          throw 'use texture in material / use material to render should set texture uniform channel type'
        }
        const texture = material.getChannelTexture(tex.channel);
        if (texture.glTextureId === undefined) {
          texture.glTextureId = this.renderer.textureManger.createTextureFromImageElement(texture.image);
          glTexture = this.renderer.textureManger.getGLTexture(texture.glTextureId);
        }
      } 

      if (glTexture === undefined) {
        const framebufferName = program.framebufferTextureMap[tex.name];
        if (framebufferName === undefined) {
          throw  `cant find framebuffer for tex ${tex.name}, please define before use`
        }
        glTexture = this.renderer.framebufferManager.getFramebufferTexture(framebufferName);
      }

      if (glTexture === undefined) {
        throw 'texture bind failed'
      }
      
      tex.useTexture(glTexture);
    })
  }

  private connectGeometry(geometry: Geometry, program: GLProgram) {
    let vaoUnbindCallback;
    if (this._vaoEnabled) {
      const vaoManager = this.renderer.vaoManager;
      const webglVAO = vaoManager.getVAO(geometry)
      if (webglVAO === undefined && geometry.needUpdate) {
        vaoManager.deleteVAO(geometry);
        vaoUnbindCallback = vaoManager.createVAO(geometry);
      } else {
        vaoManager.useVAO(webglVAO)
        return;
      }
    }

    program.forAttributes(att => {
      // TODO should not by name but by attributeUsage
      const bufferData = geometry.bufferDatum[att.name];
      if (bufferData === undefined) {
        throw `program ${program.name} needs an attribute named ${att.name}, but cant find in geometry data`;
      }
      let glBuffer = this.getGLAttributeBuffer(bufferData);
      if (glBuffer === undefined && bufferData.shouldUpdate) {
        glBuffer = this.createOrUpdateAttributeBuffer(bufferData, false);
        bufferData.shouldUpdate = false;
      }
      att.useBuffer(glBuffer);
    })

    if (program.useIndexDraw) {
      if (geometry.indexBuffer === null) {
        throw 'indexBuffer not found for index draw'
      }
      const geometryIndexBuffer = geometry.indexBuffer;
      if (geometryIndexBuffer.data instanceof Uint32Array) {
        program.indexUINT = true;
      } else {
        program.indexUINT = false;
      }
      let glBuffer = this.getGLAttributeBuffer(geometryIndexBuffer);
      if (glBuffer === undefined) {
        glBuffer = this.createOrUpdateAttributeBuffer(geometryIndexBuffer, true);
      }
      program.useIndexBuffer(glBuffer);
    }

    if (this._vaoEnabled) {
      if (vaoUnbindCallback) {
        vaoUnbindCallback.unbind();
        this.renderer.vaoManager.useVAO(vaoUnbindCallback.vao)
      }
    }
  }

  private connectRange(range: RenderRange, program: GLProgram, geometry: Geometry) {
    let start = 0;
    let count = 0;
    if (range === undefined) {
      if (geometry.indexBuffer !== null) {
        count = geometry.indexBuffer.data.length;
      } else {
        throw 'range should be set if use none index geometry'
      }
    }
    program.drawFrom = start;
    program.drawCount = count;
  }



  //  GL resource acquisition
  getGLTexture(texture: Texture): WebGLTexture {
    const id = texture.glTextureId;
    return this.renderer.getGLTexture(id);
  }
  private programTechniqueMap: Map<Technique, GLProgram> = new Map();
  getProgram(technique: Technique): GLProgram {
    return this.programTechniqueMap.get(technique);
  }

  createProgram(technique: Technique): GLProgram  {
    const program = this.renderer.createProgram(technique.createProgramConfig());
    this.programTechniqueMap.set(technique, program);
    return program;
  }

  getGLAttributeBuffer(bufferData: BufferData): WebGLBuffer {
    return this.renderer.attributeBufferManager.getGLBuffer(bufferData.data.buffer as ArrayBuffer);
  }

  createOrUpdateAttributeBuffer(bufferData: BufferData, useForIndex: boolean): WebGLBuffer {
    return this.renderer.attributeBufferManager.updateOrCreateBuffer(bufferData.data.buffer as ArrayBuffer, useForIndex);
  }



  downloadCurrentRender() {
    downloadCanvasPNGImage(this.renderer.el, 'artgl-renderscreenshot');
  }

  releaseGL() {
    this.renderer.releaseGL();
  }

  dispose() {
    this.resizeObservable.clear();
    this.releaseGL();
  }


}