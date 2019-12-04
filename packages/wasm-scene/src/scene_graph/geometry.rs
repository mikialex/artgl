use std::collections::HashMap;
use std::rc::Rc;
use crate::math::vec3::Vec3;

#[derive(Debug, Copy, Clone)]
pub struct Box3{
  pub min: Vec3<f32>, 
  pub max: Vec3<f32>,
}

impl Box3{
  pub fn new(min: Vec3<f32>, max: Vec3<f32>)-> Self{
    Box3{
      min,
      max,
    }
  }
  pub fn empty() -> Self{
    Box3::new(
      Vec3::new(std::f32::INFINITY, std::f32::INFINITY, std::f32::INFINITY),
      Vec3::new(std::f32::NEG_INFINITY, std::f32::NEG_INFINITY, std::f32::NEG_INFINITY),
    )
  }

  pub fn expandByPoint(&mut self, point: Vec3<f32>) {
    use crate::math::vec::Math;
		self.min.min(point);
		self.max.max(point);
	}

  pub fn makeFromPositionBuffer(position:&[f32]) -> Self {
    let mut b = Box3::empty();
    for index in 0..position.len()/3 {
      let i = index*3;
      b.expandByPoint(Vec3::new(position[i], position[i+1], position[i+2]));
    };
    b
  }
}

#[derive(Debug, Copy, Clone)]
pub struct Sphere{
  pub center: Vec3<f32>,
  pub radius: f32,
}

impl Sphere{
  pub fn new(center: Vec3<f32>, radius: f32) -> Self{
    Sphere{
      center,
      radius,
    }
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

  pub attributes: HashMap<String, Rc<BufferData<f32>>>

}

impl Geometry {
  pub fn new(index: usize, position: Rc<BufferData<f32>>) -> Result<Geometry, String>{
    if position.stride != 3 {
      Err(String::from("postion buffer is not stride of 3"))
    }else{
      let geo = Geometry{
        bounding_box: Box3::new(Vec3::new(1.,1.,1.), Vec3::new(1.,1.,1.)),
        bounding_sphere: Sphere::new(Vec3::new(1.,1.,1.), 1.),
        id: index, 
        position,
        index: None,
        attributes: HashMap::new()
      };
      Ok(geo)
    }
  }

  pub fn update_bounding(&mut self){
    
  }


}