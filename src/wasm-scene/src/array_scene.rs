use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ArrayScene{
  local_transform_array: Vec<f32>,
  local_position_array: Vec<f32>,

  world_transform_array: Vec<f32>,
  world_aabb_array: Vec<f32>,
  world_bsphere_array: Vec<f32>,

  empty_array: Vec<u8>,
  empty_list_array: Vec<u16>,
  empty_count: u16,

  nodes_indexs: Vec<u16>,
}

const default_node_capacity: usize = 100000;
const LOCAL_TRANSFORM_ARRAY_STRIDE: usize = 12;
const LOCAL_POSITION_ARRAY_STRIDE: usize = 3;
const WORLD_AABB_ARRAY_STRIDE: usize = 12;
const world_aabb_array_stride: usize = 6;
const world_bsphere_array_stride: usize = 4;
const node_index_stride: usize = 4;


#[wasm_bindgen]
impl ArrayScene {
  pub fn new() -> ArrayScene {
    ArrayScene {
      local_transform_array: Vec::with_capacity(100),
      local_position_array: Vec::with_capacity(100),
      world_transform_array: Vec::with_capacity(100),
      world_aabb_array: Vec::with_capacity(100),
      world_bsphere_array: Vec::with_capacity(100),

      empty_array: Vec::with_capacity(100),
      empty_list_array: Vec::with_capacity(100),
      empty_count: 0,

      nodes_indexs: Vec::with_capacity(100),
    }
  }

  #[wasm_bindgen]
  pub fn allocate(){
    
  }

  #[wasm_bindgen]
  pub fn batch_renderlist(&self){
    self.update_hirerachy();
  }

  fn traverse_from(&self, node_index: u16, 
  visitor: &Fn(u16, &mut ArrayScene) -> () 
  ){
    
  }

  fn update_hirerachy(&self){
    self.traverse_from(0, &update_hirerachy_visitor)
  }

}

fn update_hirerachy_visitor(index: u16, scene: &mut ArrayScene){
  update_localmatrix(index);
  update_worldmatrix_by_parent(index);
}

use na::{Matrix4};

fn update_worldmatrix_by_parent(index: u16){
  let local = Matrix4::new(
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
  );
  
}

fn update_localmatrix(index: u16){

}