// https://github.com/pissang/claygl/blob/master/src/core/GLInfo.js

import { GLRenderer } from "./webgl-renderer";

const EXTENSION_LIST = [
  'OES_texture_float',
  'OES_texture_half_float',
  'OES_texture_float_linear',
  'OES_texture_half_float_linear',
  'OES_standard_derivatives',
  'OES_vertex_array_object',
  'OES_element_index_uint',
  'WEBGL_compressed_texture_s3tc',
  'WEBGL_depth_texture',
  'EXT_texture_filter_anisotropic',
  'EXT_shader_texture_lod',
  'WEBGL_draw_buffers',
  'EXT_frag_depth',
  'EXT_sRGB'
];

var PARAMETER_NAMES = [
  'MAX_TEXTURE_SIZE',
  'MAX_CUBE_MAP_TEXTURE_SIZE'
];

export class GLInfo{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  renderer: GLRenderer;
  private extensions = {}
  private parameters = {}

  createExtension(name) {
    const gl = this.renderer.gl;
    var ext = gl.getExtension(name);
    if (!ext) {
      ext = gl.getExtension('MOZ_' + name);
    }
    if (!ext) {
      ext = gl.getExtension('WEBKIT_' + name);
    }
    this.extensions[name] = ext;
  }

  getExtension (name) {
    if (!(name in this.extensions)) {
      this.createExtension(name);
    }
    return this.extensions[name];
  };

  getParameter (name) {
    return this.parameters[name];
  };

  createAllExtension() {
    for (var i = 0; i < EXTENSION_LIST.length; i++) {
      var extName = EXTENSION_LIST[i];
      this.createExtension(extName);
    }
    for (var i = 0; i < PARAMETER_NAMES.length; i++) {
      var name = PARAMETER_NAMES[i];
      this.parameters[name] = this.renderer.gl.getParameter(this.renderer.gl[name]);
    }
  }
}
