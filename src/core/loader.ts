import { Geometry } from "./geometry";

export abstract class Loader {
  name: string = "unnamed loader";
  fileSuffixReg?: RegExp;
  abstract parse(input: string | ArrayBuffer): any;
}

export abstract class GeometryLoader extends Loader{
  abstract parse(input: string | ArrayBuffer): Geometry;
}