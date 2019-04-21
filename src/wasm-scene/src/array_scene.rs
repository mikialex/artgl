use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ArrayScene{
  localTransformArray: Vec<f32>,
  localPositionArray: Vec<f32>,
  worldTransformArray: Vec<f32>,
  worldAABBArray: Vec<f32>,
  worldBSphereArray: Vec<f32>,

  emptyArray: Vec<u8>,
  emptyListArray: Vec<u16>,
  emptyCount: u16,

  nodesIndexs: Vec<u16>,
}

const default_node_capacity: usize = 100000;
const localTransformArrayStride: usize = 12;
const localPositionArrayStride: usize = 3;
const worldTransformArrayStride: usize = 12;
const worldAABBArrayStride: usize = 6;
const worldBSphereArrayStride: usize = 4;
const nodeIndexStride: usize = 4;


#[wasm_bindgen]
impl ArrayScene {
  pub fn new() -> ArrayScene {
    ArrayScene {
      localTransformArray: Vec::with_capacity(100),
      localPositionArray: Vec::with_capacity(100),
      worldTransformArray: Vec::with_capacity(100),
      worldAABBArray: Vec::with_capacity(100),
      worldBSphereArray: Vec::with_capacity(100),

      emptyArray: Vec::with_capacity(100),
      emptyListArray: Vec::with_capacity(100),
      emptyCount: 0,

      nodesIndexs: Vec::with_capacity(100),
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
  visitor: &Fn(u16) -> () 
  ){
    
  }

  fn update_hirerachy(&self){
    self.traverse_from(0, self.update_hirerachy_visitor)
  }

  fn update_hirerachy_visitor(){

  }

  fn update_worldmatrix_by_parent(node_index: u16){

  }

  fn update_localmatrix(node_index: u16){

  }
}