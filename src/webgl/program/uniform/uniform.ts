import { GLProgram } from "../program";
import { UniformDescriptor, uniformUploadType } from "../../interface";
import {
  findUniformSetter, findUniformDiffer, findUniformCopier,
  setterType, differType, copierType
} from "./uniform-util";
import { GLRenderer } from "../../../artgl";

export class GLUniform {
  constructor(
    program: GLProgram,
    descriptor: UniformDescriptor,
    location: WebGLUniformLocation,
  ) {
    this.name = descriptor.name;
    this.renderer = program.renderer;
    this.gl = program.renderer.gl;
    this.location = location!;

    this.setter = findUniformSetter(descriptor.type);
    this.differ = findUniformDiffer(descriptor.type);
    this.copier = findUniformCopier(descriptor.type);

  }
  readonly name: string;
  private gl: WebGLRenderingContext;
  private programChangeId: number = -1;
  private renderer: GLRenderer;

  private location!: WebGLUniformLocation;
  value: any;
  private lastReceiveData?: uniformUploadType;
  private setter: setterType;
  private differ: differType;
  private copier: copierType;

  set(value: uniformUploadType): void {

    let programSwitched = false;
    if (this.programChangeId !== this.renderer._programChangeId) {
      programSwitched = true;
      this.programChangeId = this.renderer._programChangeId;
    }

    if (this.renderer.enableUniformDiff && !programSwitched && this.lastReceiveData!== undefined) {
      if (this.differ(value, this.lastReceiveData)) {
        this.setter(this.gl, this.location, value);
        this.renderer.stat.uniformUpload++;
        this.lastReceiveData = this.copier(value, this.lastReceiveData);
      }
    } else {
      this.setter(this.gl, this.location, value);
      this.renderer.stat.uniformUpload++;
    }
  }

}
