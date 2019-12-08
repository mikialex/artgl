use crate::math::*;
use crate::scene_graph::*;
use crate::webgl::programs::*;
use std::collections::HashMap;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::*;

#[wasm_bindgen]
pub struct WebGLRenderer {
  pub(crate) gl: Rc<WebGlRenderingContext>,

  pub(crate) active_program: Option<Rc<Program>>,

  pub(crate) programs: HashMap<Rc<Shading>, Rc<Program>>,
  pub(crate) buffers: HashMap<Rc<BufferData<f32>>, WebGlBuffer>,
  pub(crate) index_buffers: HashMap<Rc<BufferData<u16>>, WebGlBuffer>,
}

#[wasm_bindgen]
impl WebGLRenderer {
  pub fn new(canvas: HtmlCanvasElement) -> Result<WebGLRenderer, JsValue> {
    let context = canvas
      .get_context("webgl")?
      .unwrap()
      .dyn_into::<WebGlRenderingContext>()?;

    Ok(WebGLRenderer {
      gl: Rc::new(context),
      active_program: None,
      programs: HashMap::new(),
      buffers: HashMap::new(),
      index_buffers: HashMap::new(),
    })
  }

  pub fn render(&mut self, scene: &SceneGraph) {
    self.gl.clear_color(0.0, 0.0, 0.0, 1.0);
    self.gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);

    let list = scene.batch_drawcalls();

    list.foreach(|(object_id, scene_id)| {
      let object = scene.render_objects.get(*object_id);
      let scene_node = scene.nodes.get(*scene_id).borrow();

      self.use_transform(scene_node.matrix_world);
      self.use_shading(object.shading.clone());
      self.use_geometry(object.geometry.clone());
      self.draw(object.geometry.clone());
    })
    // let buffer = &self.buffers[0];
    // self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(buffer));
    // self.gl.vertex_attrib_pointer_with_i32(0, 3, WebGlRenderingContext::FLOAT, false, 0, 0);
    // self.gl.enable_vertex_attrib_array(0);

    // self.gl.use_program(Some(&self.programs.get(0).program));
    // self.gl.draw_arrays(
    //     WebGlRenderingContext::TRIANGLES,
    //     0,
    //     (9 / 3) as i32,
    // );
  }
}

impl WebGLRenderer {
  pub fn draw(&mut self, geometry: Rc<Geometry>) {
    self.gl.draw_arrays(WebGlRenderingContext::TRIANGLES, 0, (9 / 3) as i32);
  }

  pub fn use_transform(&mut self, mat: Mat4<f32>) {}

  pub fn use_shading(&mut self, shading: Rc<Shading>){
    unimplemented!()
  }

  pub fn use_geometry(&mut self, geometry: Rc<Geometry>) {
    if let Some(program) = &self.active_program {
      for (name, _) in  program.attributes.iter() {
        let buffer_data = geometry.attributes.get(name).unwrap();
        {
        let buffer = self.get_buffer(buffer_data.clone()).unwrap();
        self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(buffer));
        }
        self.gl.vertex_attrib_pointer_with_i32(0, 3, WebGlRenderingContext::FLOAT, false, 0, 0);
        self.gl.enable_vertex_attrib_array(0);
        
      }
      // program.attributes.iter().for_each(|(name, _)|{
      //   let buffer_data = geometry.attributes.get(name).unwrap();
      //   let buffer = self.get_buffer(buffer_data.clone()).unwrap();
      //   self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(buffer));
      //   self.gl.vertex_attrib_pointer_with_i32(0, 3, WebGlRenderingContext::FLOAT, false, 0, 0);
      //   self.gl.enable_vertex_attrib_array(0);
      // });
    }
  }
}
