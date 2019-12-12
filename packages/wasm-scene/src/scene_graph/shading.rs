use web_sys::WebGlRenderingContext;
use std::rc::Rc;
use crate::webgl::programs::{ProgramWrap, DynamicProgram};
use std::hash::Hash;
use std::hash::Hasher;

pub trait Shading {
  fn get_index(&self)-> usize;
  fn get_vertex_str(&self) -> &str;
  fn get_fragment_str(&self) -> &str;
  fn make_program(&self, gl: Rc<WebGlRenderingContext>) -> Rc<dyn ProgramWrap>;
}

impl Hash for dyn Shading {
  fn hash<H>(&self, state: &mut H)
  where
    H: Hasher,
  {
    self.get_index().hash(state);
  }
}

impl PartialEq for dyn Shading {
  fn eq(&self, other: &Self) -> bool {
    self.get_index() == other.get_index()
  }
}
impl Eq for dyn Shading {}

pub struct DynamicShading {
  index: usize,
  pub vertex_str: String,
  pub frag_str: String,
  pub attributes: Vec<String>,
  pub uniforms: Vec<String>,
}

impl Shading for DynamicShading {

  fn get_index(&self)-> usize {
    self.index
  }
  fn get_vertex_str(&self) -> &str{
    &self.vertex_str
  }
  fn get_fragment_str(&self) -> &str{
    &self.frag_str
  }

  fn make_program(&self, gl: Rc<WebGlRenderingContext>) -> Rc<dyn ProgramWrap>{
    Rc::new(DynamicProgram::new(
      gl.clone(),
      self.get_vertex_str(),
      self.get_fragment_str(),
      &self.attributes, 
      &self.uniforms,
    ).unwrap())
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
