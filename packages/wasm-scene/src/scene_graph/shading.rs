use std::hash::Hasher;
use std::hash::Hash;

pub struct Shading{
    index: usize,
    pub vertex_str: String,
    pub frag_str: String,
    pub attributes: Vec<String>,
    pub uniforms: Vec<String>,
}

impl Shading {
    pub fn new(index:usize, vertex_str: String, frag_str: String, 
        attributes: Vec<String>, uniforms: Vec<String>,
    ) -> Shading {
        Shading{
            index, vertex_str, frag_str,
            attributes,
            uniforms,
        }
    }
}

impl Hash for Shading {
    fn hash<H>(&self, state: &mut H)
    where
        H: Hasher,
    {
      self.index.hash(state);
    }
  }
  
  impl PartialEq for Shading {
    fn eq(&self, other: &Self) -> bool {
        self.index == other.index
    }
  }
  impl Eq for Shading {}