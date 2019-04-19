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
      localTransformArray: Vec::with_capacity(100);
      localPositionArray: Vec<f32>;
      worldTransformArray: Vec<f32>;
      worldAABBArray: Vec<f32>;
      worldBSphereArray: Vec<f32>;

      emptyArray: Vec<u8>;
      emptyListArray: Vec<u16>;
      emptyCount: u16;

      nodesIndexs: Vec<u16>;
    }
  }

  

  #[wasm_bindgen]
  pub fn allocate(){
    
  }

  #[wasm_bindgen]
  pub fn batch_renderlist(){

  }
}