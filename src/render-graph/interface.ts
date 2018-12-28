export enum pixelFormat {
  depth
}

export enum dimensionType {
  screenRelative,
  fixed
}

export interface TextureDefine {
  name: string,
  format: {
    pixelFormat: pixelFormat.depth,
    dimensionType: dimensionType.screenRelative,
    width: number,
    height: number
  }
}

export interface SourceDefine {
  name: string,
  from: string,
  filter?: () => boolean,
  transformer?: () => void,
  sorter?: () => number,
}

enum stateType {
  DisableColorWrite,
  DisableAlphaWrite
}

export interface PassDefine {
  name: string,
  input?: string[],
  output: string,
  entity: string[],
  filter?: () => boolean,
  sorter?: () => number,
  states?: stateType[],
  overrideProgram?: 'myshaderA',
}
