use crate::webgl::programs::{ProgramWrap};
use std::hash::Hash;
use std::hash::Hasher;
use std::rc::Rc;
use web_sys::WebGlRenderingContext;

pub trait Shading {
  fn get_index(&self) -> usize;
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
