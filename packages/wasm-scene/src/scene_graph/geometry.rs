use crate::math::vec3::Vec3;

pub struct Box3{
  pub min: Vec3<f32>, 
  pub max: Vec3<f32>,
}

impl Box3{
  pub fn new()-> Self{
    unimplemented!()
  }
}

pub struct Sphere{
  pub center: Vec3<f32>,
  pub radius: f32,
}

impl Sphere{
  pub fn new()-> Self{
    unimplemented!()
  }
}

pub struct Geometry {
  pub bounding_box: Box3,
  pub bounding_sphere: Sphere,
  pub id: usize,
}