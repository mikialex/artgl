use crate::scene_graph::scene_graph::{SceneGraph, SceneNode};
use wasm_bindgen::prelude::*;
use core::cell::RefCell;

#[wasm_bindgen]
impl SceneGraph {

  #[wasm_bindgen]
  pub fn create_new_node(&mut self) -> usize {
    let free_index;
    if let Some(i) = self.tomb_list.pop() {
      free_index = i;
    } else {
      free_index = self.nodes.len();
    }

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
  pub fn add(&self, index: usize, add_index: usize) {
    let mut parent = self.get_scene_node(index).borrow_mut();
    let mut child = self.get_scene_node(add_index).borrow_mut();

    if let Some(first_child_index) = parent.first_child {
      let mut old_first_child = self.get_scene_node(first_child_index).borrow_mut();


      old_first_child.left_brother = Some(add_index);
      child.right_brother = Some(first_child_index);
    }

    child.parent = Some(index);
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
  pub fn set_node_position(&mut self, index: usize, x: f32, y: f32, z: f32) {
    self.get_scene_node(index).borrow_mut().position.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn set_node_scale(&mut self, index: usize, x: f32, y: f32, z: f32) {
    self.get_scene_node(index).borrow_mut().scale.set(x, y, z);
  }

  #[wasm_bindgen]
  pub fn set_node_quaternion(&mut self, index: usize, x: f32, y: f32, z: f32, w: f32) {
    self.get_scene_node(index).borrow_mut().rotation.set(x, y, z, w);
  }

}