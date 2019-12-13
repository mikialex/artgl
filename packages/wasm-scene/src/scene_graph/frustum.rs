use crate::scene_graph::*;
use crate::math::*;

#[derive(Debug, Copy, Clone)]
pub struct Plane{
    pub normal: Vec3<f32>,
    pub constant: f32,
}

impl Plane{
    pub fn new(normal: Vec3<f32>, constant: f32)-> Self{
        Plane{
            normal,constant
        }
    }

    pub fn distance_to_point(&self, point: Vec3<f32>) ->f32{
		self.normal.dot(point) + self.constant
    }

    pub fn set_components(&mut self, x: f32,y: f32,z: f32,w: f32) -> &mut Self {
        self.normal.set(x, y, z);
        self.constant =w;
        self
    }

    pub fn normalize(&mut self) -> &mut Self {
        let inverse_normal_length = 1.0 / self.normal.length();
		self.normal = self.normal * inverse_normal_length;
		self.constant *= inverse_normal_length;
        self
    }
}

pub struct Frustum {
    planes: [Plane; 6],
}

impl Frustum{
    pub fn new() -> Self {
        Self {
            planes: [Plane::new(Vec3::new(1.0, 1., 1.), 1.);6]
        }
    }

    pub fn intersects_sphere(&self, sphere: &Sphere) -> bool {
        let neg_radius = - sphere.radius;
        
        for p in &self.planes {
            let distance = p.distance_to_point( sphere.center );
			if distance < neg_radius {
				return false;
			}
        };

        true
    }

    pub fn set_from_matrix(&mut self, m: Mat4<f32>) -> &Self{
		self.planes[ 0 ].set_components( m.a4 - m.a1, m.b4 - m.b1, m.c4 - m.c1, m.d4 - m.d1 ).normalize();
		self.planes[ 1 ].set_components( m.a4 + m.a1, m.b4 + m.b1, m.c4 + m.c1, m.d4 + m.d1 ).normalize();
		self.planes[ 2 ].set_components( m.a4 + m.a2, m.b4 + m.b2, m.c4 + m.c2, m.d4 + m.d2 ).normalize();
		self.planes[ 3 ].set_components( m.a4 - m.a2, m.b4 - m.b2, m.c4 - m.c2, m.d4 - m.d2 ).normalize();
		self.planes[ 4 ].set_components( m.a4 - m.a3, m.b4 - m.b3, m.c4 - m.c3, m.d4 - m.d3 ).normalize();
		self.planes[ 5 ].set_components( m.a4 + m.a3, m.b4 + m.b3, m.c4 + m.c3, m.d4 + m.d3 ).normalize();

        self
    }
}