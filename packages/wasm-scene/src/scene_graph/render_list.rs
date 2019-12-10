use crate::scene_graph::*;

pub struct RenderList {
  renderables: Vec<(usize, usize)>,
}

impl RenderList {
  pub fn new() -> Self {
    RenderList{
        renderables: Vec::new()
    }
  }

  pub fn get_len(&self)-> usize{
    self.renderables.len()
  }

  pub fn reset(&mut self) -> &mut Self{
    self.renderables.clear();
    self
  }

  pub fn add_renderable(&mut self, obj: &RenderObject, scene_node: &SceneNode) -> &mut Self{
    self.renderables.push((obj.index, scene_node.get_index()));
    self
  }

  pub fn foreach<T>(&self, visitor: T) where T: FnMut(&(usize, usize)){
    self.renderables.iter().for_each(visitor);
  }
}
