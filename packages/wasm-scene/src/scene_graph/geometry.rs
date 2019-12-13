use crate::math_entity::*;
use crate::scene_graph::*;
use crate::math::vec3::Vec3;
use std::collections::HashMap;
use std::rc::Rc;

pub struct Geometry {
  pub bounding_box: Box3,
  pub bounding_sphere: Sphere,
  pub id: usize,

  pub index: Option<Rc<BufferData<u16>>>,

  pub attributes: HashMap<String, Rc<BufferData<f32>>>,
}

impl Geometry {
  pub fn new(
    id: usize,
    index: Option<Rc<BufferData<u16>>>,
    position: Rc<BufferData<f32>>,
  ) -> Result<Geometry, String> {
    if position.stride != 3 {
      Err(String::from("postion buffer is not stride of 3"))
    } else {
      let mut attributes = HashMap::new();
      attributes.insert(String::from("position"), position);
      let mut geo = Geometry {
        bounding_box: Box3::new(Vec3::new(1., 1., 1.), Vec3::new(1., 1., 1.)),
        bounding_sphere: Sphere::new(Vec3::new(1., 1., 1.), 1.),
        id,
        index,
        attributes,
      };
      geo.update_bounding();
      Ok(geo)
    }
  }

  pub fn update_bounding(&mut self) {
    if let Some(position) = self.attributes.get("position") {
      self.bounding_box = Box3::make_from_position_buffer(&position.data);
      self.bounding_sphere =
        Sphere::make_from_position_buffer_with_box(&position.data, &self.bounding_box);
    }
  }
}
