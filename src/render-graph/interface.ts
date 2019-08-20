import { Vector4 } from "../math/vector4";
import { Nullable } from "../type";
import { RenderSource } from "../engine/render-engine";
import { PixelFormat } from "../webgl/const";
import { ShadingConstrain } from "./backend-interface";
export interface GraphDefine<ShadingType extends ShadingConstrain> {
  passes: PassDefine<ShadingType>[],
  renderTargets: RenderTargetDefine[];
}

export interface PassInputMapInfo{
  [index:string]: string
}

export interface PassDefine<ShadingType extends ShadingConstrain> {
  name: string,
  inputs?: () => PassInputMapInfo,
  source: RenderSource[],
  filter?: () => boolean,
  sorter?: () => number,
  states?: stateType[],
  shading?: ShadingType,
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
