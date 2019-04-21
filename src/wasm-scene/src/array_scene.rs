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

  // [parent, left brother, right brother, first child]
  nodes_indexs: Vec<i16>,
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
  pub fn batch_renderlist(&mut self){
    self.update_hirerachy();
  }

  fn traverse_from(&mut self, index: i16, 
  visitor: &Fn(i16, &mut ArrayScene) -> () 
  ){
    let mut travers_stack: Vec<i16> = Vec::with_capacity(100);
    loop {
      let first_child = self.nodes_indexs[(index as usize) + 3];
      if first_child != -1 { // has more children
        travers_stack.push(first_child);

      }
    }
  }

  fn update_hirerachy(&mut self){
    self.traverse_from(0, &update_hirerachy_visitor)
  }

}

fn update_hirerachy_visitor(index: i16, scene: &mut ArrayScene){
  update_localmatrix(index);
  update_worldmatrix_by_parent(index);
}

use na::{Matrix4};

fn update_worldmatrix_by_parent(index: i16){
  let local = Matrix4::new(
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
  );
  
}

fn update_localmatrix(index: i16){

}