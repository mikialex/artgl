use std::rc::Rc;
use wasm_bindgen::prelude::*;
use crate::math::*;


#[derive(Debug, Clone, Copy)]
pub struct Quaternion {
  pub x: f32,
  pub y: f32,
  pub z: f32,
  pub w: f32,
}

#[derive(Debug, Clone, Copy)]
pub struct Matrix4 {
  pub x: f32,
}

pub struct SceneNode {
  scene: Rc<SceneGraph>,
  index: usize,

  pub position: Vec3,
  pub scale: Vec3,
  pub rotation: Quaternion,

  pub matrix_local: Matrix4,
  pub matrix_world: Matrix4,

  pub isRenderable: bool,
  pub geometryId: Option<usize>,

  parent: Option<usize>,
  left_brother: Option<usize>,
  right_brother: Option<usize>,
  first_child: Option<usize>,
}

impl SceneNode {
  #[inline]
  pub fn parent(&self) -> Option<&SceneNode> {
    self.parent.map(|p| self.scene.get_scene_node(p))
  }

  #[inline]
  pub fn first_child(&self) -> Option<&SceneNode> {
    self.first_child.map(|p| self.scene.get_scene_node(p))
  }

  #[inline]
  pub fn left_brother(&self) -> Option<&SceneNode> {
    self.left_brother.map(|p| self.scene.get_scene_node(p))
  }

  #[inline]
  pub fn right_brother(&self) -> Option<&SceneNode> {
    self.right_brother.map(|p| self.scene.get_scene_node(p))
  }

  #[inline]
  pub fn foreach_child<F>(&self, f: F)
  where
    F: Fn(&SceneNode),
  {
    if let Some(first_child) = self.first_child() {
      f(first_child);
      while let Some(next_child) = first_child.right_brother() {
        f(next_child);
      }
    }
  }

  pub fn traverse(&self, visitor: &dyn Fn(&SceneNode) -> ()) {
    let mut travers_stack: Vec<&SceneNode> = Vec::new();
    travers_stack.push(self);

    while let Some(node_to_visit) = travers_stack.pop() {
      visitor(node_to_visit);

      // add childs to stack
      // try fix this compile
      // node_to_visit.foreach_child(|n|{travers_stack.push(n)});

      if let Some(first_child) = node_to_visit.first_child() {
        travers_stack.push(first_child);
        while let Some(next_child) = first_child.right_brother() {
          travers_stack.push(next_child);
        }
      }
    }
  }
}

#[wasm_bindgen]
#[derive(Default)]
pub struct SceneGraph {
  nodes: Vec<SceneNode>,
}

impl SceneGraph {
  pub fn get_scene_node(&self, index: usize) -> &SceneNode {
    &self.nodes[index]
  }
}

#[wasm_bindgen]
impl SceneGraph {
  #[wasm_bindgen]
  pub fn new() -> SceneGraph {
    SceneGraph { nodes: Vec::new() }
  }

  // #[wasm_bindgen]
  // pub fn setNodePosition(&mut self, index: usize, x: f32, y: f32, z: f32) {
  //   self.nodes[index].position.set(x, y, z);
  // }

  // pub fn getNode(&self, index: i32) -> SceneNode{
  //   self.nodes[index as usize]
  // }

  // #[wasm_bindgen]
  // pub fn createNode(&mut self) -> i32 {
  //   let node = SceneNode{

  //   }
  //   let index:
  // }
}
