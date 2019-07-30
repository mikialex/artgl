export interface RenderConfig {
  name: string,
  type: 'folder' | undefined,
  value: RenderConfig[] | any,
  onChange?
  editors?
}