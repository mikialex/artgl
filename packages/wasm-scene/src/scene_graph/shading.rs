pub struct Shading{
    index: usize,
    vertex_str: String,
    frag_str: String,
}

impl Shading {
    pub fn new(index:usize, vertex_str: String, frag_str: String) -> Shading {
        Shading{
            index, vertex_str, frag_str
        }
    }
}