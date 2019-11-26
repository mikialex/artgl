#[derive(Debug, Clone, Copy)]
pub struct Vec3 {
  pub x: f32,
  pub y: f32,
  pub z: f32,
}

impl Vec3 {
  pub fn zero() -> Vec3 {
    Vec3 {
      x: 0.,
      y: 0.,
      z: 0.,
    }
  }

  pub fn new(x: f32, y: f32, z: f32) -> Vec3 {
    Vec3 { x, y, z }
  }

  pub fn set(&mut self, x: f32, y: f32, z: f32) -> &Vec3 {
    self.x = x;
    self.y = y;
    self.z = z;
    self
  }

  pub fn dot(vec_a: &Vec3, vec_b: &Vec3) -> f32 {
    vec_a.x * vec_b.x + vec_a.y * vec_b.y + vec_a.z * vec_b.z
  }

  pub fn reflect(normal: &Vec3, in_ray: &Vec3) -> Vec3 {
    *in_ray - 2. * Vec3::dot(normal, in_ray) * (*normal)
  }

  pub fn cross(vec_a: &Vec3, vec_b: &Vec3) -> Vec3 {
    Vec3 {
      x: vec_a.y * vec_b.z - vec_a.z * vec_b.y,
      y: vec_a.x * vec_b.z - vec_a.z * vec_b.x,
      z: vec_a.x * vec_b.y - vec_a.y * vec_b.x,
    }
  }

  pub fn norm(&self) -> f32 {
    self.x * self.x + self.y * self.y + self.z * self.z
  }

  pub fn length(&self) -> f32 {
    self.norm().sqrt()
  }

  pub fn normalize(&mut self) -> &Self {
    let inv_len = self.length().recip();
    self.x *= inv_len;
    self.y *= inv_len;
    self.z *= inv_len;
    self
  }

  pub fn copy_from(&mut self, other: &Vec3) {
    self.x = other.x;
    self.y = other.y;
    self.z = other.z;
  }

  pub fn max(&self, other: &Vec3) -> Vec3 {
    Vec3::new(
      self.x.max(other.x),
      self.y.max(other.y),
      self.z.max(other.z),
    )
  }

  pub fn min(&self, other: &Vec3) -> Vec3 {
    Vec3::new(
      self.x.min(other.x),
      self.y.min(other.y),
      self.z.min(other.z),
    )
  }
}

impl std::ops::Add for Vec3 {
  fn add(self, other: Vec3) -> Vec3 {
    Vec3 {
      x: self.x + other.x,
      y: self.y + other.y,
      z: self.z + other.z,
    }
  }

  type Output = Vec3;
}

impl std::ops::AddAssign for Vec3 {
  fn add_assign(&mut self, other: Vec3) {
    self.x = self.x + other.x;
    self.y = self.y + other.y;
    self.z = self.z + other.z;
  }
}

impl std::ops::Sub for Vec3 {
  fn sub(self, other: Vec3) -> Vec3 {
    Vec3 {
      x: self.x - other.x,
      y: self.y - other.y,
      z: self.z - other.z,
    }
  }
  type Output = Vec3;
}

impl std::ops::Mul<f32> for Vec3 {
  fn mul(self, scalar: f32) -> Vec3 {
    Vec3 {
      x: self.x * scalar,
      y: self.y * scalar,
      z: self.z * scalar,
    }
  }

  type Output = Vec3;
}

impl std::ops::Mul<Vec3> for f32 {
  fn mul(self, vec: Vec3) -> Vec3 {
    Vec3 {
      x: self * vec.x,
      y: self * vec.y,
      z: self * vec.z,
    }
  }

  type Output = Vec3;
}

impl std::ops::Mul<Vec3> for Vec3 {
  fn mul(self, other: Vec3) -> Vec3 {
    Vec3 {
      x: self.x * other.x,
      y: self.y * other.y,
      z: self.z * other.z,
    }
  }

  type Output = Vec3;
}

impl std::ops::MulAssign for Vec3 {
  fn mul_assign(&mut self, other: Vec3) -> () {
    self.x = self.x * other.x;
    self.y = self.y * other.y;
    self.z = self.z * other.z;
  }
}

impl std::ops::Div<f32> for Vec3 {
  fn div(self, scalar: f32) -> Vec3 {
    Vec3 {
      x: self.x / scalar,
      y: self.y / scalar,
      z: self.z / scalar,
    }
  }

  type Output = Vec3;
}

impl std::ops::Div<Vec3> for Vec3 {
  fn div(self, another: Vec3) -> Vec3 {
    Vec3 {
      x: self.x / another.x,
      y: self.y / another.y,
      z: self.z / another.z,
    }
  }

  type Output = Vec3;
}
