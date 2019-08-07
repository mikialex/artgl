export interface RenderConfig {
  name: string,
  type?: 'folder',
  value: RenderConfig[] | any,
  valueConfig?: {
    type?: string,
    selectItem?: string[];
  },
  onChange?
  editors?
}