use crate::math::mat4::Mat4;
use crate::scene_graph::*;
use crate::math::vec::Math;
use crate::math::vec3::Vec3;
use std::collections::HashMap;
use std::hash::Hasher;
use std::rc::Rc;

#[derive(Debug, Copy, Clone)]
pub struct Box3 {
  pub min: Vec3<f32>,
  pub max: Vec3<f32>,
}

impl Box3 {
  pub fn new(min: Vec3<f32>, max: Vec3<f32>) -> Self {
    Box3 { min, max }
  }
  pub fn empty() -> Self {
    Box3::new(
      Vec3::new(std::f32::INFINITY, std::f32::INFINITY, std::f32::INFINITY),
      Vec3::new(
        std::f32::NEG_INFINITY,
        std::f32::NEG_INFINITY,
        std::f32::NEG_INFINITY,
      ),
    )
  }

  pub fn expand_by_point(&mut self, point: Vec3<f32>) {
    self.min.min(point);
    self.max.max(point);
  }

  pub fn make_from_position_buffer(position: &[f32]) -> Self {
    let mut b = Box3::empty();
    for index in 0..position.len() / 3 {
      let i = index * 3;
      b.expand_by_point(Vec3::new(position[i], position[i + 1], position[i + 2]));
    }
    b
  }

  pub fn apply_matrix(&mut self, mat: &Mat4<f32>) -> Self{
    unimplemented!()
  }
}

#[derive(Debug, Copy, Clone)]
pub struct Sphere {
  pub center: Vec3<f32>,
  pub radius: f32,
}

impl Sphere {
  pub fn new(center: Vec3<f32>, radius: f32) -> Self {
    Sphere { center, radius }
  }

  pub fn make_from_position_buffer_with_box(position: &[f32], box3: &Box3) -> Self {
    let center = (box3.max + box3.min) / 2.;
    let mut max_distance2 = 0.;
    for index in 0..position.len() / 3 {
      let i = index * 3;
      let p = Vec3::new(position[i], position[i + 1], position[i + 2]);
      let d = (p - center).length2();
      max_distance2 = max_distance2.max(d);
    }
    Sphere::new(center, max_distance2.sqrt())
  }

  pub fn apply_matrix(mut self, mat: &Mat4<f32>) -> Self {
    self.center = self.center.apply_mat4(mat);
    self.radius = self.radius * mat.max_scale_on_axis();
    self
  }
}

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
