import { Vector4 } from "../math/vector4";
import { Nullable } from "../type";
import { PixelFormat } from "../webgl/const";
import { Shading } from "../core/shading";

export interface GraphDefine {
  passes: PassDefine[],
  renderTargets: RenderTargetDefine[];
}

export interface PassInputMapInfo{
  [index:string]: string
}

export interface PassDefine{
  name: string,
  inputs?: () => PassInputMapInfo,
  source: Function[],
  filter?: () => boolean,
  sorter?: () => number,
  states?: stateType[],
  shading?: Shading,
  enableColorClear?:boolean,
  enableDepthClear?:boolean,
  clearColor?: Vector4,
  afterPassExecute?: () => any,
  beforePassExecute?: () => any,
}

export enum DimensionType {
  bindRenderSize,
  fixed
}

export interface RenderTargetDefine {
  name: string,
  from: () => Nullable<string>
  keepContent?: () => boolean
  format?: {
    pixelFormat?: PixelFormat,
    dimensionType?: DimensionType,
    width?: number,
    height?: number,
    enableDepthBuffer?: boolean
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
