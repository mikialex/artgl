use crate::scene_graph::scene_graph::{SceneGraph, SceneNode, RenderData};
use crate::scene_graph::geometry::*;
use wasm_bindgen::prelude::*;
use core::cell::RefCell;
use std::rc::Rc;

#[wasm_bindgen]
impl SceneGraph {

  pub fn create_new_buffer_data(&mut self, data: Vec<f32>, stride: usize) -> usize{
    let free_index = self.buffers.get_free_index();
    let buffer_data = Rc::new(BufferData::new(free_index, data, stride));
    self.buffers.set_item(buffer_data, free_index);
    free_index
  }

  pub fn create_geometry(&mut self, position:usize){
    
  }


}