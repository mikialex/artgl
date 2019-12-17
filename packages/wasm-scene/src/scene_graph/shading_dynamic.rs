use fnv::FnvHasher;
use crate::webgl::renderer::uploadMatrix4f;
use std::collections::HashMap;
use std::hash::BuildHasherDefault;
use crate::scene_graph::*;
use crate::webgl::*;
use std::rc::Rc;
use web_sys::*;


pub struct DynamicShading {
  index: usize,
  pub vertex_str: String,
  pub frag_str: String,
  pub attributes: Vec<String>,
  pub uniforms: Vec<String>,
}

impl Shading for DynamicShading {
  fn get_index(&self) -> usize {
    self.index
  }
  fn get_vertex_str(&self) -> &str {
    &self.vertex_str
  }
  fn get_fragment_str(&self) -> &str {
    &self.frag_str
  }

  fn make_program(&self, gl: Rc<WebGlRenderingContext>) -> Rc<dyn ProgramWrap> {
    Rc::new(
      DynamicProgram::new(
        gl.clone(),
        self.get_vertex_str(),
        self.get_fragment_str(),
        &self.attributes,
        &self.uniforms,
      )
      .unwrap(),
    )
  }
}

impl DynamicShading {
  pub fn new(
    index: usize,
    vertex_str: String,
    frag_str: String,
    attributes: Vec<String>,
    uniforms: Vec<String>,
  ) -> DynamicShading {
    DynamicShading {
      index,
      vertex_str,
      frag_str,
      attributes,
      uniforms,
    }
  }
}

pub struct DynamicProgram {
  context: Rc<WebGlRenderingContext>,
  pub program: WebGlProgram,
  pub uniforms: HashMap<String, WebGlUniformLocation, BuildHasherDefault<FnvHasher>>,
  pub attributes: HashMap<String, i32, BuildHasherDefault<FnvHasher>>,
}

impl ProgramWrap for DynamicProgram {
  fn get_program(&self) -> &WebGlProgram{
    &self.program
  }

  fn upload_uniforms(&self, renderer: &WebGLRenderer){
    let model_matrix_location = self.uniforms.get("model_matrix").unwrap();
    uploadMatrix4f(&renderer.gl, model_matrix_location, &renderer.model_transform);

    let camera_inverse_location = self.uniforms.get("camera_inverse").unwrap();
    uploadMatrix4f(&renderer.gl, camera_inverse_location, &renderer.camera_inverse);

    let projection_matrix_location = self.uniforms.get("projection_matrix").unwrap();
    uploadMatrix4f(&renderer.gl, projection_matrix_location, &renderer.camera_projection);
  }

  fn get_attributes(&self) -> &HashMap<String, i32, BuildHasherDefault<FnvHasher>>{
    &self.attributes
  }

}

impl DynamicProgram {

  pub fn new(
    context: Rc<WebGlRenderingContext>,
    vertex_shader_str: &str,
    frag_shader_str: &str,
    attributes_vec: &[String], 
    uniforms_vec: &[String]
  ) -> Result<DynamicProgram, String> {
    let program = make_webgl_program(&context, vertex_shader_str, frag_shader_str)?;

    // let activeUniform = context.get_program_parameter(&program, WebGlRenderingContext::ACTIVE_UNIFORMS);

    let mut uniforms = HashMap::with_hasher(BuildHasherDefault::<FnvHasher>::default());
    uniforms_vec.iter().for_each(|name| {
      uniforms.insert(name.clone(), context.get_uniform_location(&program, name).unwrap());
    });

    let mut attributes = HashMap::with_hasher(BuildHasherDefault::<FnvHasher>::default());
    attributes_vec.iter().for_each(|name| {
      attributes.insert(name.clone(), context.get_attrib_location(&program, name));
    });

    Ok(DynamicProgram { 
      context, 
      program,
      uniforms,
      attributes
      })
  }
}
