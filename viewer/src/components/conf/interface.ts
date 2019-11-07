export interface RenderConfig {
  name: string,
  type?: 'folder',
  value?: RenderConfig[] | any,
  show?: Function,
  onClick?: Function,
  valueConfig?: {
    type?: string,
    selectItem?: string[];
  },
  onChange?: Function
  editors?: any
}