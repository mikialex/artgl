use std::rc::Rc;
use crate::math::*;
use wasm_bindgen::prelude::*;
use crate::utils::{set_panic_hook};

#[wasm_bindgen]
pub struct ArraySceneAllocationProtocal {
  pub local_transform_array_start: *const f32,
  pub local_position_array_start: *const f32,
  pub local_rotation_array_start: *const f32,
  pub local_scale_array_start: *const f32,

  pub world_transform_array_start: *const f32,
  pub local_aabb_array_start: *const f32,
  pub world_aabb_array_start: *const f32,
  pub local_bsphere_array_start: *const f32,
  pub world_bsphere_array_start: *const f32,

  pub nodes_indexs_start: *const i32,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub struct Vec3{
  pub x: f32,
  pub y: f32,
  pub z: f32
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub struct Quaternion{
  pub x: f32,
  pub y: f32,
  pub z: f32,
  pub w: f32,
}

#[wasm_bindgen]
pub struct SceneNode {
  pub position: Vec3,
  pub scale: Vec3,

  parent: Option<i32>,
  left_brother: Option<i32>,
  right_brother: Option<i32>,
  first_child: Option<i32>,

}

#[wasm_bindgen]
pub struct SceneGraph {
  nodes: Vec<SceneNode>

}

#[wasm_bindgen]
impl SceneGraph {

  #[wasm_bindgen]
  pub fn new() -> SceneGraph{
    SceneGraph{
      nodes: Vec::new()
    }
  }
  
  #[wasm_bindgen]
  pub fn getNode(&self, index: i32) -> SceneNode{
    self.nodes[index as usize]
  }

  // #[wasm_bindgen]
  // pub fn createNode(&mut self) -> i32 {
  //   let node = SceneNode{

  //   }
  //   let index: 
  // }
}


#[wasm_bindgen]
pub struct ArrayScene {
  local_transform_array: Vec<f32>,
  local_position_array: Vec<f32>,
  local_rotation_array: Vec<f32>,
  local_scale_array: Vec<f32>,
  world_transform_array: Vec<f32>,

  local_aabb_array: Vec<f32>,
  world_aabb_array: Vec<f32>,
  local_bsphere_array: Vec<f32>,
  world_bsphere_array: Vec<f32>,

  empty_array: Vec<u8>,
  empty_list_array: Vec<u16>,
  empty_count: u16,

  // [parent, left brother, right brother, first child]
  nodes_indexs: Vec<i32>,
}

pub const DEFAULT_NODE_CAPACITY: usize = 100;
pub const TRANSFORM_ARRAY_STRIDE: usize = 16;
pub const POSITION_ARRAY_STRIDE: usize = 3;
pub const ROTATION_ARRAY_STRIDE: usize = 3;
pub const SCALE_ARRAY_STRIDE: usize = 3;
pub const WORLD_AABB_ARRAY_STRIDE: usize = 12;
pub const WORLD_BSPHERE_ARRAY_STRIDE: usize = 4;
pub const NODE_INDEX_STRIDE: usize = 4;

#[wasm_bindgen]
impl ArrayScene {
  pub fn new() -> ArrayScene {
    set_panic_hook();

    ArrayScene {
      local_transform_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * TRANSFORM_ARRAY_STRIDE),
      local_position_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * POSITION_ARRAY_STRIDE),
      local_rotation_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * ROTATION_ARRAY_STRIDE),
      local_scale_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * SCALE_ARRAY_STRIDE),
      world_transform_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * TRANSFORM_ARRAY_STRIDE),

      local_aabb_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * WORLD_AABB_ARRAY_STRIDE),
      world_aabb_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * WORLD_AABB_ARRAY_STRIDE),
      local_bsphere_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * WORLD_BSPHERE_ARRAY_STRIDE),
      world_bsphere_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY * WORLD_BSPHERE_ARRAY_STRIDE),

      empty_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY),
      empty_list_array: Vec::with_capacity(DEFAULT_NODE_CAPACITY),
      empty_count: 0,

      nodes_indexs: Vec::with_capacity(DEFAULT_NODE_CAPACITY * NODE_INDEX_STRIDE),
    }
  }

  #[wasm_bindgen]
  pub fn allocate(&mut self, capacity: usize) -> ArraySceneAllocationProtocal {
    // self.local_transform_array = Vec::with_capacity(capacity * TRANSFORM_ARRAY_STRIDE);
    self.local_transform_array = vec![0.0; capacity * TRANSFORM_ARRAY_STRIDE];
    self.local_position_array = vec![0.0; capacity * POSITION_ARRAY_STRIDE];
    self.local_rotation_array = vec![0.0; capacity * ROTATION_ARRAY_STRIDE];
    self.local_scale_array = vec![0.0; capacity * SCALE_ARRAY_STRIDE];
    self.world_transform_array = vec![0.0; capacity * TRANSFORM_ARRAY_STRIDE];

    self.local_aabb_array = vec![0.0; capacity * WORLD_AABB_ARRAY_STRIDE];
    self.world_aabb_array = vec![0.0; capacity * WORLD_AABB_ARRAY_STRIDE];
    self.local_bsphere_array = vec![0.0; capacity * WORLD_BSPHERE_ARRAY_STRIDE];
    self.world_bsphere_array = vec![0.0; capacity * WORLD_BSPHERE_ARRAY_STRIDE];

    self.empty_array = vec![0; capacity];
    self.empty_list_array = vec![0; capacity];

    self.nodes_indexs = vec![0; capacity * NODE_INDEX_STRIDE];

    ArraySceneAllocationProtocal {
      local_transform_array_start: self.local_transform_array.as_ptr(),
      local_position_array_start: self.local_position_array.as_ptr(),
      local_rotation_array_start: self.local_rotation_array.as_ptr(),
      local_scale_array_start: self.local_scale_array.as_ptr(),
      world_transform_array_start: self.world_transform_array.as_ptr(),

      local_aabb_array_start: self.local_aabb_array.as_ptr(),
      world_aabb_array_start: self.world_aabb_array.as_ptr(),
      local_bsphere_array_start: self.local_bsphere_array.as_ptr(),
      world_bsphere_array_start: self.world_bsphere_array.as_ptr(),

      nodes_indexs_start: self.nodes_indexs.as_ptr(),
    }
  }

  // #[wasm_bindgen]
  // pub fn update_projection(&mut self, matrix: [f32]) {

  // }

  #[wasm_bindgen]
  pub fn batch_renderlist(&mut self) {
    self.update_hirerachy();
  }

  fn traverse_from(&mut self, index: i32, visitor: &Fn(i32, &mut ArrayScene) -> ()) {
    let mut travers_stack: Vec<i32> = Vec::with_capacity(100);
    travers_stack.push(index);
    while let Some(node_to_visit) = travers_stack.pop() {
      visitor(node_to_visit, self);

      // add childs to stack
      let first_child = self.nodes_indexs[(node_to_visit as usize) * NODE_INDEX_STRIDE + 3];
      if first_child != -1 { // has children
        travers_stack.push(first_child);
        let mut current_child = first_child;
        loop {
          let next_child = self.nodes_indexs[(current_child as usize) * NODE_INDEX_STRIDE + 2];
          if next_child != -1 {
            travers_stack.push(next_child);
            current_child = next_child;
          } else {
            break;
          }
        }
      }
    }
  }

  fn update_hirerachy(&mut self) {
    self.traverse_from(0, &update_hirerachy_visitor)
  }
}

use crate::log_i16;

fn update_hirerachy_visitor(index: i32, scene: &mut ArrayScene) {
  // update_localmatrix(
  //   index,
  //   &scene.local_position_array,
  //   &scene.local_rotation_array,
  //   &scene.local_scale_array,
  //   &mut scene.local_transform_array,
  // );
  update_worldmatrix_by_parent(
    index,
    &scene.nodes_indexs,
    &scene.local_transform_array,
    &mut scene.world_transform_array,
  );
}
