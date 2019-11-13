import { Geometry } from "./geometry";

/**
 * Base class for resource loader 
 * Any loader should extends this for comprehensive usage
 *
 * @export
 * @abstract
 * @class Loader
 */
export abstract class Loader {
  name: string = "unnamed loader";

  /**
   * This regExp is for matching giving file extension name
   * whether should be use with this loader
   *
   * @type {RegExp}
   * @memberof Loader
   */
  fileSuffixReg?: RegExp;
  abstract parse(input: string | ArrayBuffer): any;
}

export abstract class GeometryLoader extends Loader{
  abstract parse(input: string | ArrayBuffer): Geometry;
}