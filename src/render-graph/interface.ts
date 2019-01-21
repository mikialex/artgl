export enum PixelFormat {
  depth,
  rgba
}

export enum DimensionType {
  screenRelative,
  fixed
}

export interface RenderTextureDefine {
  name: string,
  format: {
    pixelFormat: PixelFormat,
    dimensionType: DimensionType,
    width: number,
    height: number,
    disableDepthBuffer?: boolean
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
  inputs?: string[],
  output: string,
  source: string[],
  filter?: () => boolean,
  sorter?: () => number,
  states?: stateType[],
  technique?: string,
}

export interface GraphDefine {
  passes: PassDefine[],
  renderTextures?: RenderTextureDefine[];
}