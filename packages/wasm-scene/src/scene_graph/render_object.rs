use crate::math::mat4::Mat4;
use crate::scene_graph::*;
use std::rc::Rc;

pub struct RenderObject {
  pub index: usize,
  pub shading: Rc<dyn Shading>,
  pub geometry: Rc<Geometry>,
  pub world_bounding_box: Box3,
  pub world_bounding_sphere: Sphere,
}

impl RenderObject {
  pub fn new(index: usize, shading: Rc<dyn Shading>, geometry: Rc<Geometry>) -> Self {
    let world_bounding_box = geometry.bounding_box;
    let world_bounding_sphere = geometry.bounding_sphere;
    RenderObject {
      index,
      shading,
      geometry,
      world_bounding_box,
      world_bounding_sphere,
    }
  }

  pub fn update_world_bounding(&mut self, world_matrix: &Mat4<f32>) -> &mut Self {
    let mut bbox = self.geometry.bounding_box;
    self.world_bounding_box = bbox.apply_matrix(world_matrix);
    self.world_bounding_sphere = self.geometry.bounding_sphere.apply_matrix(world_matrix);
    self
  }
}
