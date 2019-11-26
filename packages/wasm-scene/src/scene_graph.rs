use crate::math::*;
use std::rc::Rc;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy)]
pub struct Quaternion {
  pub x: f32,
  pub y: f32,
  pub z: f32,
  pub w: f32,
}

impl Quaternion {
  pub fn new() -> Quaternion {
    unimplemented!()
  }
}

pub struct RenderDescriptor {}

pub struct SceneNode {
  index: usize,

  pub position: Vec3,
  pub scale: Vec3,
  pub rotation: Quaternion,

  pub matrix_local: Matrix4,
  pub matrix_world: Matrix4,

  pub render_data: Option<RenderDescriptor>,

  parent: Option<usize>,
  left_brother: Option<usize>,
  right_brother: Option<usize>,
  first_child: Option<usize>,
}

impl SceneNode {
  pub fn new(index: usize) -> SceneNode {
    SceneNode {
      index,
      position: Vec3::zero(),
      scale: Vec3::new(1., 1., 1.),
      rotation: Quaternion::new(),
      matrix_local: Matrix4::new(),
      matrix_world: Matrix4::new(),
      render_data: None,
      parent: None,
      left_brother: None,
      right_brother: None,
      first_child: None,
    }
  }
  
  pub fn get_index(&self) -> usize {
    self.index
  }

}

#[wasm_bindgen]
#[derive(Default)]
pub struct SceneGraph {
  nodes: Vec<Option<SceneNode>>,
  tomb_list: Vec<usize>,
}

impl SceneGraph {
  pub fn get_scene_node(&self, index: usize) -> &SceneNode {
    if let Some(node) = &self.nodes[index] {
      return node;
    }
    panic!("try get a deleted node")
  }

  pub fn get_scene_node_mut(&mut self, index: usize) -> &mut SceneNode {
    if let Some(node) = &mut self.nodes[index] {
      return node;
    }
    panic!("try get a deleted node")
  }

  pub fn parent(&self, node: &SceneNode) -> Option<&SceneNode> {
    node.parent.map(|p| self.get_scene_node(p))
  }

  pub fn first_child(&self, node: &SceneNode) -> Option<&SceneNode> {
    node.first_child.map(|p| self.get_scene_node(p))
  }

  pub fn left_brother(&self, node: &SceneNode) -> Option<&SceneNode> {
    node.left_brother.map(|p| self.get_scene_node(p))
  }

  pub fn right_brother(&self, node: &SceneNode) -> Option<&SceneNode> {
    node.right_brother.map(|p| self.get_scene_node(p))
  }

  pub fn foreach_child<F>(&self, node: &SceneNode, f: F)
  where
    F: Fn(&SceneNode),
  {
    if let Some(first_child) = self.first_child(node) {
      f(first_child);
      let mut child_next = first_child;
      while let Some(next_child) = self.right_brother(child_next) {
        f(next_child);
        child_next = next_child
      }
    }
  }

  pub fn traverse(&self, node: &SceneNode, visitor: &dyn Fn(&SceneNode) -> ()) {
    let mut travers_stack: Vec<&SceneNode> = Vec::new();
    travers_stack.push(node);

    while let Some(node_to_visit) = travers_stack.pop() {
      visitor(node_to_visit);

      // add childs to stack
      // try fix this compile TODO
      // node_to_visit.foreach_child(|n|{travers_stack.push(n)});

      if let Some(first_child) = self.first_child(node_to_visit) {
        travers_stack.push(first_child);
        let mut child_next = first_child;
        while let Some(next_child) = self.right_brother(child_next) {
          travers_stack.push(next_child);
          child_next = next_child
        }
      }

    }
  }
}

#[wasm_bindgen]
impl SceneGraph {
  #[wasm_bindgen]
  pub fn new() -> SceneGraph {
    SceneGraph {
      nodes: Vec::new(),
      tomb_list: Vec::new(),
    }
  }

  #[wasm_bindgen]
  pub fn create_new_node(&mut self) -> usize {
    let free_index;
    if let Some(i) = self.tomb_list.pop() {
      free_index = i;
    } else {
      free_index = self.nodes.len();
    }

    let new_node = SceneNode::new(free_index);
    self.nodes[free_index] = Some(new_node);
    free_index
  }

  #[wasm_bindgen]
  pub fn free_node(&mut self, index: usize) {
    if let Some(_) = &self.nodes[index] {
      self.nodes[index] = None;
      self.tomb_list.push(index);
    }else{
      panic!("node has been deleted before")
    }
  }

  #[wasm_bindgen]
  pub fn set_node_position(&mut self, index: usize, x: f32, y: f32, z: f32) {
    self.get_scene_node_mut(index).position.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn set_node_scale(&mut self, index: usize, x: f32, y: f32, z: f32) {
    self.get_scene_node_mut(index).scale.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn set_node_quaternion(&mut self, index: usize, x: f32, y: f32, z: f32, w: f32) {
    // self.nodes[index].quaternion.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn batch_drawcalls(&mut self) {
    let root = self.get_scene_node_mut(0);
    // self.traverse(root, &update_hirerachy_visitor);
  }
}


// fn update_hirerachy_visitor(index: i32, scene: &mut SceneGraph) {
//   // update_localmatrix(
//   //   index,
//   //   &scene.local_position_array,
//   //   &scene.local_rotation_array,
//   //   &scene.local_scale_array,
//   //   &mut scene.local_transform_array,
//   // );
//   update_worldmatrix_by_parent(
//     index,
//     &scene.nodes_indexs,
//     &scene.local_transform_array,
//     &mut scene.world_transform_array,
//   );
// }
