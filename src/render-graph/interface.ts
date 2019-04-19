import { Vector4 } from "../math/vector4";
import { Nullable } from "../type";
export interface GraphDefine {
  passes: PassDefine[],
  renderTargets: RenderTargetDefine[];
}

export interface PassInputMapInfo{
  [index:string]: string
}

export interface PassDefine {
  name: string,
  inputs?: () => PassInputMapInfo,
  source: string[],
  filter?: () => boolean,
  sorter?: () => number,
  states?: stateType[],
  technique?: string,
  enableColorClear?:boolean,
  enableDepthClear?:boolean,
  clearColor?: Vector4,
  afterPassExecute?: () => any,
  beforePassExecute?: () => any,
}


export enum PixelFormat {
  depth,
  rgba
}

export enum DimensionType {
  bindRenderSize,
  fixed
}

export interface RenderTargetDefine {
  name: string,
  from: () => Nullable<string>
  format?: {
    pixelFormat: PixelFormat,
    dimensionType: DimensionType,
    width?: number,
    height?: number,
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
