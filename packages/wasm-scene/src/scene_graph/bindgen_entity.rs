use crate::scene_graph::*;
use std::rc::Rc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl SceneGraph {

  pub fn create_new_shading(&mut self, vertex_str: String, frag_str: String) -> usize {
    let free_index = self.shadings.get_free_index();
    let shading = Rc::new(Shading::new(free_index, vertex_str, frag_str));
    self.shadings.set_item(shading, free_index);
    free_index
  }

  pub fn create_new_buffer_data(&mut self, data: Vec<f32>, stride: usize) -> usize {
    let free_index = self.buffers.get_free_index();
    let buffer_data = Rc::new(BufferData::new(free_index, data, stride));
    self.buffers.set_item(buffer_data, free_index);
    free_index
  }

  pub fn create_geometry(&mut self, position_index: usize) -> Result<usize, JsValue> {
    let free_index = self.geometries.get_free_index();
    let position = self.buffers.get(position_index);
    let geometry = Rc::new(Geometry::new(free_index, position.clone())?);
    self.geometries.set_item(geometry, free_index);
    Ok(free_index)
  }

  pub fn create_render_data(&mut self, geometry_id: usize, shading_id: usize) -> usize {
    let geometry = self.geometries.get(geometry_id).clone();
    let shading = self.shadings.get(shading_id).clone();
    let free_index = self.render_objects.get_free_index();
    let obj = Rc::new(RenderObject::new(free_index, shading, geometry));
    self.render_objects.set_item(obj, free_index);
    free_index
  }

  pub fn set_render_descriptor(&mut self, render_object_id: usize, node_index: usize) {
    let obj = self.render_objects.get(render_object_id);
    self.get_scene_node(node_index).borrow_mut().render_data = Some(obj.clone());
  }
}
