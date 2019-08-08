import { GLRenderer } from "../webgl/gl-renderer";
import { RenderObject, RenderRange } from "../core/render-object";
import { Camera } from "../core/camera";
import { Matrix4 } from "../math/matrix4";
import { GLProgram } from "../webgl/program";
import { Geometry } from "../core/geometry";
import { BufferData } from "../core/buffer-data";
import { Material } from "../core/material";
import { GLTextureUniform } from "../webgl/uniform/uniform-texture";
import { PerspectiveCamera } from "../camera/perspective-camera";
import { Nullable, GLReleasable } from "../type";
import { InnerSupportUniform, InnerUniformMap } from "../webgl/uniform/uniform";
import { UniformProxy } from "./uniform-proxy";
import { Observable } from "../core/observable";
import { GLFramebuffer } from '../webgl/gl-framebuffer';
import { QuadSource } from '../render-graph/quad-source';
import { downloadCanvasPNGImage } from "../util/file-io";
import { CopyShading } from "../shading/pass-lib/copy";
import { NormalShading } from "../artgl";
import { VAOCreateCallback } from "../webgl/vao";
import { Vector4 } from "../math/vector4";
import { Shading, ShaderUniformProvider } from "../core/shading";
import { Interactor } from "../interact/interactor";

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


const copyShading = new Shading().decorate(new CopyShading());
const quad = new QuadSource();

export class RenderEngine implements GLReleasable{
  constructor(el?: HTMLCanvasElement, ctxOptions?: any) {
    this.renderer = new GLRenderer(el, ctxOptions);
    // if we have a element param, use it as the default camera's param for convenience
    if (el !== undefined) {
      (this.camera as PerspectiveCamera).aspect = el.width / el.height;
    }

    this.interactor = new Interactor(el);

    InnerUniformMap.forEach((des, key) => {
      this.globalUniforms.set(key, new UniformProxy(des.default))
    })
    
    this.preferVAO = true;
  }

  readonly interactor: Interactor

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


  public overrideShading: Nullable<Shading> = null;
  public defaultTechnique: Shading = new Shading().decorate(new NormalShading());

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
   * @memberof RenderEngine
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

  renderObject(object: RenderObject) {

    // prepare technique
    const program = this.connectShading(object);

    // prepare material
    this.connectMaterial(object.material, program);

    // prepare geometry
    this.connectGeometry(object.geometry, program);

    this.connectRange(object.range, program, object.geometry)

    object.state.syncGL(this.renderer)

    // render
    this.renderer.draw(object.drawMode);
  }

  renderFrameBuffer(framebuffer: GLFramebuffer, debugViewPort: Vector4) {
    this.renderer.setRenderTargetScreen();
    this.renderer.state.setViewport(
      debugViewPort.x, debugViewPort.y,
      debugViewPort.z, debugViewPort.w
    );

    this.overrideShading = copyShading;
    this.overrideShading.getProgram(this).defineFrameBufferTextureDep(
      framebuffer.name, 'copySource'
    );
    this.render(quad);
    this.overrideShading = null;
  }
  ////




  //// low level resource binding

  /**
   * GlobalUniforms is store useful inner support uniforms
   * Engine will update these values and auto bind them to
   * program that you will draw as needed
   *
   * @private
   * @type {Map<InnerSupportUniform, UniformProxy>}
   * @memberof RenderEngine
   */
  private globalUniforms: Map<InnerSupportUniform, UniformProxy> = new Map();
  getGlobalUniform(uniform: InnerSupportUniform): UniformProxy {
    return this.globalUniforms.get(uniform) as UniformProxy 
  }

  private lastUploadedShaderUniformProvider: Set<ShaderUniformProvider> = new Set();
  private lastProgramRendered: GLProgram;


  private connectShading(object: RenderObject): GLProgram {

    // // get shading, check override, default situation
    let shading: Shading;
    if (this.overrideShading !== null) {
      shading = this.overrideShading;
    } else if (object.shading !== undefined) {
      shading = object.shading;
    } else {
      shading = this.defaultTechnique;
    }

    // get program, refresh provider cache if changed
    const program = shading.getProgram(this);
    if (this.lastProgramRendered !== program) {
      this.lastUploadedShaderUniformProvider.clear();
    }

    this.renderer.useProgram(program);

    this.getGlobalUniform(InnerSupportUniform.MMatrix).setValue(object.worldMatrix);
    program.updateInnerGlobalUniforms(this); // TODO maybe minor optimize here

    shading._decorators.forEach(decorator => {
      decorator.foreachProvider(provider => {
        if (this.lastUploadedShaderUniformProvider.has(provider)
          && !provider.hasAnyUniformChanged
        ) {
          // if we found this uniform provider has updated before and not changed, we can skip!
          return;
        }
        provider.uniforms.forEach((value, key) => {
          program.setUniformIfExist(key, value); // maybe user defined, but not really in shader
        })
        provider.hasAnyUniformChanged = false;
        this.lastUploadedShaderUniformProvider.add(provider);
      })
    })

    return program;
  }

  private connectMaterial(material: Material, program: GLProgram) {

    program.forTextures((tex: GLTextureUniform) => {
      let glTexture: WebGLTexture | undefined;

      // acquire texture from material
      if (material !== undefined) {
        if (tex.channel === undefined) {
          throw 'use texture in material / use material to render should set texture uniform channel type'
        }
        const texture = material.getChannelTexture(tex.channel);
        glTexture = texture.getGLTexture(this);
      } 

      // acquire texture from framebuffer
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
    
    // check index buffer and update program.indexUINT
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
    }

    // vao check
    let vaoUnbindCallback: VAOCreateCallback;
    if (this._vaoEnabled) {
      const vaoManager = this.renderer.vaoManager;
      const webglVAO = vaoManager.getVAO(geometry)
      if (webglVAO === undefined && geometry.checkBufferArrayChange()) {
        vaoManager.deleteVAO(geometry);
        vaoUnbindCallback = vaoManager.createVAO(geometry);
      } else {
        vaoManager.useVAO(webglVAO)
        return;
      }
    }

    // common procedure
    program.forAttributes(att => {
      const bufferData = geometry.getBuffer(att.name);
      if (bufferData === undefined) {
        throw `program needs an attribute named ${att.name}, but cant find in geometry data`;
      }
      let glBuffer = this.getGLAttributeBuffer(bufferData);
      if (glBuffer === undefined && bufferData.dataChanged) {
        glBuffer = this.createOrUpdateAttributeBuffer(bufferData, false);
        bufferData.dataChanged = false;
      }
      att.useBuffer(glBuffer);
    })

    if (program.useIndexDraw) {
      const geometryIndexBuffer = geometry.indexBuffer;
      let glBuffer = this.getGLAttributeBuffer(geometryIndexBuffer);
      if (glBuffer === undefined) {
        glBuffer = this.createOrUpdateAttributeBuffer(geometryIndexBuffer, true);
      }
      program.useIndexBuffer(glBuffer);
    }

    // create vao
    if (this._vaoEnabled) {
      if (vaoUnbindCallback !== undefined) {
        vaoUnbindCallback.unbind();
        geometry._markBufferArrayHasUpload();
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
    } else {
      start = range.start;
      count = range.count;
    }
    program.drawFrom = start;
    program.drawCount = count;
  }



  //  GL resource acquisition
  private programShadingMap: Map<Shading, GLProgram> = new Map();
  getProgram(shading: Shading): GLProgram {
    return this.programShadingMap.get(shading);
  }

  createProgram(shading: Shading): GLProgram  {
    const program = this.renderer.createProgram(shading.getProgramConfig());
    this.programShadingMap.set(shading, program);
    return program;
  }

  deleteProgram(shading: Shading) {
    const program = this.programShadingMap.get(shading);
    if (program !== undefined) {
      program.dispose();
      this.programShadingMap.delete(shading);
    }
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
    this.interactor.dispose();
  }


}