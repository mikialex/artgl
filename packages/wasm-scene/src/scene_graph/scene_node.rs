use std::rc::Rc;
use crate::math::*;
use crate::scene_graph::*;

pub struct SceneNode {
    index: usize,
  
    pub position: Vec3<f32>,
    pub scale: Vec3<f32>,
    pub rotation: Quat<f32>,
  
    pub matrix_local: Mat4<f32>,
    pub matrix_world: Mat4<f32>,
  
    pub render_data: Option<Rc<RenderObject>>,
  
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