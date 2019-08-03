// https://github.com/pissang/claygl/blob/master/src/core/GLInfo.js

export enum GLExtList {
  ANGLE_instanced_arrays = "ANGLE_instanced_arrays",
  OES_texture_float = "OES_texture_float",
  OES_texture_half_float = "OES_texture_half_float",
  OES_texture_float_linear = "OES_texture_float_linear",
  OES_texture_half_float_linear = "OES_texture_half_float_linear",
  OES_standard_derivatives = "OES_standard_derivatives",
  OES_vertex_array_object = "OES_vertex_array_object",
  OES_element_index_uint = "OES_element_index_uint",
  WEBGL_compressed_texture_s3tc = "WEBGL_compressed_texture_s3tc",
  WEBGL_depth_texture = "WEBGL_depth_texture",
  EXT_texture_filter_anisotropic = "EXT_texture_filter_anisotropic",
  EXT_shader_texture_lod = "EXT_shader_texture_lod",
  WEBGL_draw_buffers = "WEBGL_draw_buffers",
  EXT_frag_depth = "EXT_frag_depth",
  EXT_sRGB = "EXT_sRGB"
}

export enum GLParamList {
  MAX_TEXTURE_SIZE = "MAX_TEXTURE_SIZE",
  MAX_CUBE_MAP_TEXTURE_SIZE = "MAX_CUBE_MAP_TEXTURE_SIZE"
}

const EXTENSION_LIST = Object.keys(GLExtList);
const PARAMETER_NAMES = Object.keys(GLParamList);

export class GLInfo {
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.createAllExtension();
    this.getAllParams();
    if (this.getExtension(GLExtList.OES_element_index_uint) !== undefined) {
      this.supportUintIndexDraw = true;
    }
  }
  private gl: WebGLRenderingContext
  private extensions: { [index: string]: any } = {}
  private parameters: { [index: string]: any } = {}
  readonly supportUintIndexDraw: boolean;

  private createExtension(name: string) {
    const gl = this.gl;
    var ext = gl.getExtension(name);
    if (!ext) {
      ext = gl.getExtension('MOZ_' + name);
    }
    if (!ext) {
      ext = gl.getExtension('WEBKIT_' + name);
    }
    this.extensions[name] = ext;
  }

  getExtension(name: GLExtList) {
    if (!(name in this.extensions)) {
      this.createExtension(name);
    }
    return this.extensions[name];
  };

  getParameter(name: string) {
    return this.parameters[name];
  };

  private createAllExtension() {
    for (var i = 0; i < EXTENSION_LIST.length; i++) {
      var extName = EXTENSION_LIST[i];
      this.createExtension(extName);
    }
  }

  private getAllParams() {
    for (var i = 0; i < PARAMETER_NAMES.length; i++) {
      var name = PARAMETER_NAMES[i];
      this.parameters[name] = this.gl.getParameter((this.gl as any)[name]);
    }
  }
}
