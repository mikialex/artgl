use std::rc::Rc;
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

pub struct BufferData<T> {
  id: usize,
  data: Vec<T>,
  stride: usize,
}

impl<T> BufferData<T> {
  pub fn new(id: usize, data: Vec<T>, stride: usize) -> BufferData<T>{
    BufferData {
      id,
      data,
      stride,
    }
  }
}


pub struct Geometry {
  pub bounding_box: Box3,
  pub bounding_sphere: Sphere,
  pub id: usize,

  pub position: Rc<BufferData<f32>>, 
  pub index: Option<Rc<BufferData<usize>>>,

}

impl Geometry {
  pub fn new(index: usize, position: Rc<BufferData<f32>>) -> Geometry{
    Geometry{
      bounding_box: Box3::new(),
      bounding_sphere: Sphere::new(),
      id: index, 
      position,
      index: None,
    }
  }

  pub fn update_bounding(&mut self){
    
  }


}