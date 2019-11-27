use crate::{log_usize, log};
use core::cell::RefMut;
use core::cell::Ref;
use core::cell::RefCell;
use crate::math::*;
use wasm_bindgen::prelude::*;

pub struct RenderDescriptor {
  // boundingBox
// boundingSphere
// shaderId: usize
}

pub struct SceneNode {
  index: usize,

  pub position: Vec3<f32>,
  pub scale: Vec3<f32>,
  pub rotation: Quat<f32>,

  pub matrix_local: Mat4<f32>,
  pub matrix_world: Mat4<f32>,

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
      scale: Vec3::one(),
      rotation: Quat::one(),
      matrix_local: Mat4::one(),
      matrix_world: Mat4::one(),
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
  nodes: Vec<Option<RefCell<SceneNode>>>,
  tomb_list: Vec<usize>,
}

impl SceneGraph {
  pub fn get_scene_node(&self, index: usize) -> &RefCell<SceneNode> {
    if let Some(node) = &self.nodes[index] {
      return &node;
    }
    panic!("try get a deleted node")
  }

  pub fn traverse(&self, node: &RefCell<SceneNode>, visitor: &dyn Fn(&RefCell<SceneNode>, &SceneGraph) -> ()) {
    let mut travers_stack: Vec<&RefCell<SceneNode>> = Vec::new();
    travers_stack.push(node);

    while let Some(node_to_visit) = travers_stack.pop() {
      visitor(node_to_visit, self);

      // add childs to stack
      // try fix this compile TODO
      // node_to_visit.foreach_child(|n|{travers_stack.push(n)});

      if let Some(first_child_index) = node_to_visit.borrow().first_child {
        let first_child = self.get_scene_node(first_child_index);
        travers_stack.push(first_child);
        let mut child_next = first_child;
        while let Some(next_child_index) = child_next.borrow().right_brother {
          let next_child = self.get_scene_node(next_child_index);
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
    let root = SceneNode::new(0);
    SceneGraph {
      nodes: vec![Some(RefCell::new(root))],
      tomb_list: Vec::new(),
    }
  }

  #[wasm_bindgen]
  pub fn create_new_node(&mut self) -> usize {
    // log("new");
    let free_index;
    if let Some(i) = self.tomb_list.pop() {
      free_index = i;
    } else {
      free_index = self.nodes.len();
    }

    // log_usize(free_index);
    let new_node = SceneNode::new(free_index);
    if free_index >= self.nodes.len() {
      self.nodes.push(Some(RefCell::new(new_node)));
    }else{
      self.nodes[free_index] = Some(RefCell::new(new_node));
    }
    free_index
  }

  #[wasm_bindgen]
  pub fn free_node(&mut self, index: usize) {
    if let Some(_) = &self.nodes[index] {
      self.nodes[index] = None;
      self.tomb_list.push(index);
    } else {
      panic!("node has been deleted before")
    }
  }

  #[wasm_bindgen]
  pub fn set_node_position(&mut self, index: usize, x: f32, y: f32, z: f32) {
    self.get_scene_node(index).borrow_mut().position.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn set_node_scale(&mut self, index: usize, x: f32, y: f32, z: f32) {
    self.get_scene_node(index).borrow_mut().scale.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn set_node_quaternion(&mut self, index: usize, x: f32, y: f32, z: f32, w: f32) {
    // self.nodes[index].quaternion.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn add(&self, index: usize, add_index: usize) {
    // log("add");
    // log_usize(add_index);
    let mut parent = self.get_scene_node(index).borrow_mut();
    let mut child = self.get_scene_node(add_index).borrow_mut();

    if let Some(first_child_index) = parent.first_child {
      let mut old_first_child = self.get_scene_node(first_child_index).borrow_mut();


      old_first_child.left_brother = Some(add_index);
      child.right_brother = Some(first_child_index);
      child.parent = Some(index);
    }

    parent.first_child = Some(add_index);

  }

  #[wasm_bindgen]
  pub fn remove(&self, index: usize) {
    let mut self_node = self.get_scene_node(index).borrow_mut();
    if let Some(parent_index) = self_node.parent {

      self_node.parent = None;
      let mut parent = self.get_scene_node(parent_index).borrow_mut();

      // updating parent first index
      if let Some(first_child_index) = parent.first_child {
        if first_child_index == index {

          if let Some(right_brother_index) = self_node.right_brother {
            let right_brother = self.get_scene_node(right_brother_index).borrow_mut();
            parent.first_child = Some(right_brother.get_index());
          }else{
            parent.first_child = None;
          }

        }
      }

      if let Some(right_brother_index) = self_node.right_brother {
        let mut right_brother = self.get_scene_node(right_brother_index).borrow_mut();
        if let Some(left_brother_index) = self_node.left_brother {
          let left_brother = self.get_scene_node(left_brother_index).borrow_mut();
          right_brother.left_brother = Some(left_brother.get_index());
        }else{
          right_brother.left_brother = None;
        }
      }

      if let Some(left_brother_index) = self_node.left_brother {
        let mut left_brother = self.get_scene_node(left_brother_index).borrow_mut();
        if let Some(right_brother_index) = self_node.right_brother {
          let right_brother = self.get_scene_node(right_brother_index).borrow_mut();
          left_brother.right_brother = Some(right_brother.get_index());
        }else{
          left_brother.right_brother = None;
        }
      }

    }else{
      unreachable!()
    }
  }

  #[wasm_bindgen]
  pub fn batch_drawcalls(&self) {
    let root = self.get_scene_node(0);
    self.traverse(root, &update_hirerachy_visitor);
  }
}

fn update_hirerachy_visitor(node: &RefCell<SceneNode>, scene: &SceneGraph) {
  // let parent = scene.parent(node);
  let mut self_node = node.borrow_mut();
  if let Some(parent_index) = self_node.parent {
    let parent_node = scene.get_scene_node(parent_index).borrow_mut();
    self_node.matrix_world = self_node.matrix_world * parent_node.matrix_world;
  }
}
