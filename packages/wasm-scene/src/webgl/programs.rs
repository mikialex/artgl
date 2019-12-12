use crate::webgl::renderer::uploadMatrix4f;
use std::collections::HashMap;
use std::hash::BuildHasherDefault;
use crate::scene_graph::*;
use crate::webgl::*;
use std::rc::Rc;
use web_sys::*;

use fnv::FnvHasher;

impl WebGLRenderer {
  pub fn get_program(&mut self, shading: Rc<dyn Shading>) -> Result<Rc<dyn ProgramWrap>, String> {
    let gl = self.gl.clone();
    Ok(
      self
        .programs
        .entry(shading.clone())
        .or_insert_with(||{
          shading.make_program(gl)
      })
        .clone(),
    )
  }
}

pub trait ProgramWrap {
  fn get_program(&self) -> &WebGlProgram;
  fn upload_uniforms(&self, renderer: &WebGLRenderer);
  fn get_attributes(&self) -> &HashMap<String, i32, BuildHasherDefault<FnvHasher>>;
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
    attributes_vec: &Vec<String>, 
    uniforms_vec: &Vec<String>
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

pub fn make_webgl_program(context: &WebGlRenderingContext, vertex_shader_str: &str, frag_shader_str: &str)
 -> Result<WebGlProgram, String>
{
  let vertex_shader = compile_shader(
    &context,
    WebGlRenderingContext::VERTEX_SHADER,
    vertex_shader_str,
  )?;
  let frag_shader = compile_shader(
    &context,
    WebGlRenderingContext::FRAGMENT_SHADER,
    frag_shader_str,
  )?;
  link_program(&context, &vertex_shader, &frag_shader)
}

fn compile_shader(
  context: &WebGlRenderingContext,
  shader_type: u32,
  source: &str,
) -> Result<WebGlShader, String> {
  let shader = context
    .create_shader(shader_type)
    .ok_or_else(|| String::from("Unable to create shader object"))?;
  context.shader_source(&shader, source);
  context.compile_shader(&shader);

  if context
    .get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS)
    .as_bool()
    .unwrap_or(false)
  {
    Ok(shader)
  } else {
    Err(
      context
        .get_shader_info_log(&shader)
        .unwrap_or_else(|| String::from("Unknown error creating shader")),
    )
  }
}

fn link_program(
  context: &WebGlRenderingContext,
  vert_shader: &WebGlShader,
  frag_shader: &WebGlShader,
) -> Result<WebGlProgram, String> {
  let program = context
    .create_program()
    .ok_or_else(|| String::from("Unable to create shader object"))?;

  context.attach_shader(&program, vert_shader);
  context.attach_shader(&program, frag_shader);
  context.link_program(&program);

  if context
    .get_program_parameter(&program, WebGlRenderingContext::LINK_STATUS)
    .as_bool()
    .unwrap_or(false)
  {
    Ok(program)
  } else {
    Err(
      context
        .get_program_info_log(&program)
        .unwrap_or_else(|| String::from("Unknown error creating program object")),
    )
  }
}
