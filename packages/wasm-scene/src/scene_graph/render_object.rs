use std::rc::Rc;
use crate::scene_graph::scene_graph::*;
use crate::scene_graph::geometry::*;

pub struct RenderObject {
  pub index: usize,
  pub shading: Rc<Shading>,
  pub geometry: Rc<Geometry>,
  pub world_bounding_box: Box3,
  pub world_bounding_sphere: Sphere,
}
  
impl RenderObject{
  pub fn new(index: usize, shading: Rc<Shading>, geometry: Rc<Geometry>)-> Self{
    let world_bounding_box = geometry.bounding_box;
    let world_bounding_sphere = geometry.bounding_sphere;
    RenderObject{
      index,
      shading,
      geometry,
      world_bounding_box,
      world_bounding_sphere,
    }
  }
}