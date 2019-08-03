export interface RenderConfig {
  name: string,
  type?: 'folder',
  value: RenderConfig[] | any,
  onChange?
  editors?
}