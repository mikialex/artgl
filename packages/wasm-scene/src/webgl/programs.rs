use std::collections::HashMap;
use std::hash::BuildHasherDefault;
use crate::scene_graph::*;
use crate::webgl::*;
use std::rc::Rc;
use web_sys::*;

use fnv::FnvHasher;

impl WebGLRenderer {
  pub fn get_program(&mut self, shading: Rc<Shading>) -> Result<Rc<Program>, String> {
    let gl = self.gl.clone();
    Ok(
      self
        .programs
        .entry(shading.clone())
        .or_insert_with(||{Rc::new(Program::new(
          gl.clone(),
          &shading.vertex_str,
          &shading.frag_str,
          &shading.attributes, 
          &shading.uniforms,
        ).unwrap())})
        .clone(),
    )
  }
}

// pub struct Attribute {
//   location: i32,
// }

// pub struct Uniform {
//   location: WebGlUniformLocation,
// }

pub struct Program {
  context: Rc<WebGlRenderingContext>,
  pub program: WebGlProgram,
  pub uniforms: HashMap<String, WebGlUniformLocation, BuildHasherDefault<FnvHasher>>,
  pub attributes: HashMap<String, i32, BuildHasherDefault<FnvHasher>>,
}

impl Program {
  pub fn get_program(&self) -> &WebGlProgram {
    &self.program
  }

  pub fn new(
    context: Rc<WebGlRenderingContext>,
    vertex_shader_str: &str,
    frag_shader_str: &str,
    attributes_vec: &Vec<String>, 
    uniforms_vec: &Vec<String>
  ) -> Result<Program, String> {
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
    let program = link_program(&context, &vertex_shader, &frag_shader)?;

    // let activeUniform = context.get_program_parameter(&program, WebGlRenderingContext::ACTIVE_UNIFORMS);

    let mut uniforms = HashMap::with_hasher(BuildHasherDefault::<FnvHasher>::default());
    uniforms_vec.iter().for_each(|name| {
      uniforms.insert(name.clone(), context.get_uniform_location(&program, name).unwrap());
    });

    let mut attributes = HashMap::with_hasher(BuildHasherDefault::<FnvHasher>::default());
    attributes_vec.iter().for_each(|name| {
      attributes.insert(name.clone(), context.get_attrib_location(&program, name));
    });

    Ok(Program { 
      context, 
      program,
      uniforms,
      attributes
      })
  }
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
