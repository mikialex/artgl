use crate::utils::set_panic_hook;
use crate::math::*;
use crate::scene_graph::*;
use crate::utils::ArrayContainer;
use crate::{log, log_usize};
use core::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SceneGraph {
  pub(crate) camera: Camera,
  pub(crate) nodes: ArrayContainer<RefCell<SceneNode>>,
  pub(crate) buffers: ArrayContainer<Rc<BufferData<f32>>>,
  pub(crate) geometries: ArrayContainer<Rc<Geometry>>,
  pub(crate) shadings: ArrayContainer<Rc<Shading>>,
  pub(crate) render_objects: ArrayContainer<Rc<RenderObject>>,
}

impl SceneGraph {
  pub fn set_camera(&mut self, camera: Camera){
    self.camera = camera;
  }

  pub fn get_scene_node(&self, index: usize) -> &RefCell<SceneNode> {
    self.nodes.get(index)
  }

  pub fn traverse<T>(&self, node: &RefCell<SceneNode>, visitor: T)
  where
    T: Fn(&RefCell<SceneNode>, &SceneGraph) -> (),
  {
    let mut traverse_stack: Vec<&RefCell<SceneNode>> = Vec::new();
    traverse_stack.push(node);

    while let Some(node_to_visit) = traverse_stack.pop() {
      visitor(node_to_visit, self);

      // add children to stack
      if let Some(first_child_index) = node_to_visit.borrow().first_child {
        let first_child = self.get_scene_node(first_child_index);
        traverse_stack.push(first_child);
        let mut child_next = first_child;
        while let Some(next_child_index) = child_next.borrow().right_brother {
          let next_child = self.get_scene_node(next_child_index);
          traverse_stack.push(next_child);
          child_next = next_child
        }
      }
    }
  }
}

#[wasm_bindgen]
impl SceneGraph {
  pub fn new() -> SceneGraph {
    set_panic_hook();
    let mut graph = SceneGraph {
      camera: Camera::new(),
      nodes: ArrayContainer::new(),
      buffers: ArrayContainer::new(),
      geometries: ArrayContainer::new(),
      shadings: ArrayContainer::new(),
      render_objects: ArrayContainer::new(),
    };
    graph.create_new_node(); // as root
    graph
  }

  pub fn batch_drawcalls(&self) {
    let root = self.get_scene_node(0);

    self.traverse(root, |node: &RefCell<SceneNode>, scene: &SceneGraph| {
      let mut self_node = node.borrow_mut();
      if let Some(parent_index) = self_node.parent {
        let parent_node = scene.get_scene_node(parent_index).borrow_mut();
        self_node.matrix_world = self_node.matrix_world * parent_node.matrix_world;
      }
    })
  }
}

// #[wasm_bindgen(inline_js = "export function doNothing(a, b) { return a + b }")]
// extern "C" {
//     fn doNothing(a: usize, b: usize);

// }
