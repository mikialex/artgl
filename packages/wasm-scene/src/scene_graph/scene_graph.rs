use crate::utils::ArrayContainer;
use crate::scene_graph::geometry::*;
use std::rc::Rc;
use crate::{log_usize, log};
use core::cell::RefCell;
use crate::math::*;
use wasm_bindgen::prelude::*;

pub struct Shading {
  pub id: usize,
  
}

pub struct BufferData{
  pub id: usize
}

pub struct RenderData {
  pub shading: Rc<Shading>,
  pub geometry: Rc<Geometry>,
  pub world_bounding_box: Box3,
  pub world_bounding_sphere: Sphere,
}

impl RenderData{
  pub fn new(shading: Rc<Shading>, geometry: Rc<Geometry>)-> Self{
    let world_bounding_box = geometry.bounding_box;
    let world_bounding_sphere = geometry.bounding_sphere;
    RenderData{
      shading,
      geometry,
      world_bounding_box,
      world_bounding_sphere,
    }
  }
}

pub struct SceneNode {
  index: usize,

  pub position: Vec3<f32>,
  pub scale: Vec3<f32>,
  pub rotation: Quat<f32>,

  pub matrix_local: Mat4<f32>,
  pub matrix_world: Mat4<f32>,

  pub render_data: Option<RenderData>,

  pub(crate) parent: Option<usize>,
  pub(crate) left_brother: Option<usize>,
  pub(crate) right_brother: Option<usize>,
  pub(crate) first_child: Option<usize>,
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
pub struct SceneGraph {
  pub(crate) nodes: ArrayContainer<RefCell<SceneNode>>,
  pub(crate) buffers: ArrayContainer<Rc<BufferData>>,
  pub(crate) geometries: ArrayContainer<Rc<Geometry>>,
  pub(crate) shadings: ArrayContainer<Rc<Shading>>,
}

impl SceneGraph {
  pub fn get_scene_node(&self, index: usize) -> &RefCell<SceneNode> {
    self.nodes.get(index)
  }

  pub fn traverse<T>
  (&self, node: &RefCell<SceneNode>, visitor: T)
  where T: Fn(&RefCell<SceneNode>, &SceneGraph) -> () {
    let mut travers_stack: Vec<&RefCell<SceneNode>> = Vec::new();
    travers_stack.push(node);

    while let Some(node_to_visit) = travers_stack.pop() {
      visitor(node_to_visit, self);

      // add childs to stack
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
  pub fn new() -> SceneGraph {
    let mut graph = SceneGraph {
      nodes: ArrayContainer::new(),
      buffers:  ArrayContainer::new(),
      geometries:  ArrayContainer::new(),
      shadings:  ArrayContainer::new(),
    };
    graph.create_new_node(); // as root
    graph
  }

  pub fn batch_drawcalls(&self) {
    let root = self.get_scene_node(0);

    self.traverse(root, 
      |node: &RefCell<SceneNode>, scene: &SceneGraph|{

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