export interface ShaderGraphUniformProvider{
  shouldProxyedByUBO: boolean;
}

export const UvFragVary = "v_uv"
export const NormalFragVary = "v_normal"
export const NDCPositionFragVary = "v_position_ndc"
export const WorldPositionFragVary = "v_position_world"

export const EyeDirection = 'inner_eye_dir'
export const FragWorldPosition = 'inner_frag_world_position'

export const enum ChannelType {
  diffuse = 'tex_diffuse',
  roughness = 'tex_roughness',
  metallic = 'tex_metallic',
  ao = 'tex_ao'
}