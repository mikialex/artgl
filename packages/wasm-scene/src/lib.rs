mod array_scene;
mod math;
mod math_util;
mod scene;
mod scene_graph;
mod utils;

use wasm_bindgen::prelude::*;
extern crate nalgebra as na;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);

  #[wasm_bindgen(js_namespace = console)]
  pub fn log(s: &str);

  #[wasm_bindgen(js_namespace = console, js_name = log)]
  pub fn log_f32(s: f32);

  #[wasm_bindgen(js_namespace = console, js_name = log)]
  pub fn log_i16(s: i16);
}

#[wasm_bindgen]
pub fn greet() {
  alert("Hello, wasm-scene!");
}
