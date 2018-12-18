import { Geometry, defaultGeometryLayoutDataInfo } from "../core/geometry";
import { Vector3 } from "../math/vector3";
import { Vector2 } from "../math/vector2";
import { loadStringFromFile } from "../util/file-io";
import { Float32BufferData, Uint16BufferData } from "../core/buffer-data";
import { generateNormalFromPostion } from "../util/normal-generation";
import { StandradGeometry } from "../geometry/standrad-geometry";

export async function loadObjFile(): Promise<Geometry> {
  const loader = new OBJLoader();
  const str = await loadStringFromFile();
  return loader.parse(str);
}

export class OBJLoader {
  private vertexPattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
  // vn float float float

  private normalPattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
  // vt float float

  private uvPattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
  // f vertex vertex vertex ...

  private facePattern1 = /f\s+(([\d]{1,}[\s]?){3,})+/;
  // f vertex/uvs vertex/uvs vertex/uvs ...

  private facePattern2 = /f\s+((([\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
  // f vertex/uvs/normal vertex/uvs/normal vertex/uvs/normal ...

  private facePattern3 = /f\s+((([\d]{1,}\/[\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
  // f vertex//normal vertex//normal vertex//normal ...

  private facePattern4 = /f\s+((([\d]{1,}\/\/[\d]{1,}[\s]?){3,})+)/;

  private collectTriangle(faces: string[]): string[] {
    const triangles = [];
    this.getTriangles(faces, 1, triangles);
    return triangles;
  }

  private getTriangles(face: string[], v: number, triangleList: string[]) {
    //Work for each element of the array
    //Result obtained after 2 iterations:
    //Pattern1 => triangle = ["1","2","3","1","3","4"];
    //Pattern2 => triangle = ["1/1","2/2","3/3","1/1","3/3","4/4"];
    //Pattern3 => triangle = ["1/1/1","2/2/2","3/3/3","1/1/1","3/3/3","4/4/4"];
    //Pattern4 => triangle = ["1//1","2//2","3//3","1//1","3//3","4//4"];
    if (v + 1 < face.length) {
      //Add on the triangle variable the indexes to obtain triangles
      triangleList.push(face[0], face[v], face[v + 1]);
      //Incrementation for recursion
      v += 1;
      //Recursion
      this.getTriangles(face, v, triangleList);
    }
  }

  private positions: Vector3[] = [];
  private normals: Vector3[] = [];
  private uvs: Vector2[] = [];

  private indicesForBabylon: number[] = [];         //The list of indices for VertexData
  private wrappedPositionForBabylon: Vector3[] = [];//The list of position in vectors
  private wrappedUvsForBabylon: Vector2[] = [];     //Array with all value of uvs to match with the indices
  private wrappedNormalsForBabylon: Vector3[] = []; //Array with all value of normals to match with the indices
  //Create a tuple with indice of Position, Normal, UV  [pos, norm, uvs]
  private tuplePosNorm: Array<{ normals: Array<number>; idx: Array<number> }> = [];
  private curPositionInIndices: number = 0;

  private isInArray(position: number, normal: number) {
    if (!this.tuplePosNorm[position]) {
      this.tuplePosNorm[position] = { normals: [], idx: [] };
    }
    const idx = this.tuplePosNorm[position].normals.indexOf(normal);
    return idx === -1 ? -1 : this.tuplePosNorm[position].idx[idx];
    ``
  };

  private setData(
    indicePositionFromObj: number,
    indiceUvsFromObj: number,
    indiceNormalFromObj: number,
    positionVectorFromOBJ: Vector3,
    textureVectorFromOBJ: Vector2,
    normalsVectorFromOBJ: Vector3
  ) {
    //Check if this tuple already exists in the list of tuples
    const index = this.isInArray(indicePositionFromObj, indiceNormalFromObj);
    
    //If it not exists
    if (index === -1) {
      //Add an new indice.
      //The array of indices is only an array with his length equal to the number of triangles - 1.
      //We add vertices data in this order
      this.indicesForBabylon.push(this.wrappedPositionForBabylon.length);
      //Push the position of vertice for Babylon
      //Each element is a BABYLON.Vector3(x,y,z)
      this.wrappedPositionForBabylon.push(positionVectorFromOBJ);
      //Push the uvs for Babylon
      //Each element is a BABYLON.Vector3(u,v)
      this.wrappedUvsForBabylon.push(textureVectorFromOBJ);
      //Push the normals for Babylon
      //Each element is a BABYLON.Vector3(x,y,z)
      this.wrappedNormalsForBabylon.push(normalsVectorFromOBJ);
      //Add the tuple in the comparison list
      this.tuplePosNorm[indicePositionFromObj].normals.push(indiceNormalFromObj);
      this.tuplePosNorm[indicePositionFromObj].idx.push(this.curPositionInIndices);
      this.curPositionInIndices++
    } else {
      //The tuple already exists
      //Add the index of the already existing tuple
      //At this index we can get the value of position, normal and uvs of vertex
      this.indicesForBabylon.push(index);
    }
  };

  private setDataForCurrentFaceWithPattern1(face: string[]) {
    const triangleStrs = this.collectTriangle(face);
    //For each element in the triangles array.
    //This var could contains 1 to an infinity of triangles
    for (var k = 0; k < triangleStrs.length; k++) {
      // Set position indice
      var indicePositionFromObj = parseInt(triangleStrs[k]) - 1;
      this.setData(
        indicePositionFromObj,
        0, 0,                                  //In the pattern 1, normals and uvs are not defined
        this.positions[indicePositionFromObj], //Get the vectors data
        new Vector2(), new Vector3(0, 1, 0)      //Create default vectors
      );
    }
  };

  private setDataForCurrentFaceWithPattern2(face: string[]) {
    const triangleStrs = this.collectTriangle(face);
    for (var k = 0; k < triangleStrs.length; k++) {
      //triangle[k] = "1/1"
      //Split the data for getting position and uv
      var point = triangleStrs[k].split("/"); // ["1", "1"]
      //Set position indice
      var indicePositionFromObj = parseInt(point[0]) - 1;
      //Set uv indice
      var indiceUvsFromObj = parseInt(point[1]) - 1;

      this.setData(
        indicePositionFromObj,
        indiceUvsFromObj,
        0,                                  //Default value for normals
        this.positions[indicePositionFromObj],   //Get the values for each element
        this.uvs[indiceUvsFromObj],
        new Vector3(0, 1, 0)                //Default value for normals
      );
    }
  }

  private setDataForCurrentFaceWithPattern3(face: string[]) {
    const triangleStrs = this.collectTriangle(face);
    for (var k = 0; k < triangleStrs.length; k++) {
      //triangle[k] = "1/1/1"
      //Split the data for getting position, uv, and normals
      var point = triangleStrs[k].split("/"); // ["1", "1", "1"]
      // Set position indice
      var indicePositionFromObj = parseInt(point[0]) - 1;
      // Set uv indice
      var indiceUvsFromObj = parseInt(point[1]) - 1;
      // Set normal indice
      var indiceNormalFromObj = parseInt(point[2]) - 1;

      this.setData(
        indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj,
        this.positions[indicePositionFromObj],
        this.uvs[indiceUvsFromObj],
        this.normals[indiceNormalFromObj] //Set the vector for each component
      );

    }
  };

  private setDataForCurrentFaceWithPattern4 = (face: string[]) => {
    const triangleStrs = this.collectTriangle(face);
    for (var k = 0; k < triangleStrs.length; k++) {
      //triangle[k] = "1//1"
      //Split the data for getting position and normals
      var point = triangleStrs[k].split("//"); // ["1", "1"]
      // We check indices, and normals
      var indicePositionFromObj = parseInt(point[0]) - 1;
      var indiceNormalFromObj = parseInt(point[1]) - 1;

      this.setData(
        indicePositionFromObj,
        1, //Default value for uv
        indiceNormalFromObj,
        this.positions[indicePositionFromObj], //Get each vector of data
        new Vector2(0, 0),
        this.normals[indiceNormalFromObj]
      );
    }
  };

  parse(objStr: string): Geometry {

    //Split the file into lines
    const lines = objStr.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      let result: string[];

      //Comment or newLine
      if (line.length === 0 || line.charAt(0) === '#') {
        continue;

      } else if ((result = this.vertexPattern.exec(line)) !== null) {
        this.positions.push(new Vector3(
          parseFloat(result[1]),
          parseFloat(result[2]),
          parseFloat(result[3])
        ));
      } else if ((result = this.normalPattern.exec(line)) !== null) {
        this.normals.push(new Vector3(
          parseFloat(result[1]),
          parseFloat(result[2]),
          parseFloat(result[3])
        ));

      } else if ((result = this.uvPattern.exec(line)) !== null) {
        this.uvs.push(new Vector2(
          parseFloat(result[1]),
          parseFloat(result[2])
        ));
      } else if ((result = this.facePattern3.exec(line)) !== null) {
        //Value of result:
        //["f 1/1/1 2/2/2 3/3/3", "1/1/1 2/2/2 3/3/3"...]

        //Set the data for this face
        this.setDataForCurrentFaceWithPattern3(
          result[1].trim().split(" "), // ["1/1/1", "2/2/2", "3/3/3"]
        );

      } else if ((result = this.facePattern4.exec(line)) !== null) {
        //Value of result:
        //["f 1//1 2//2 3//3", "1//1 2//2 3//3"...]

        //Set the data for this face
        this.setDataForCurrentFaceWithPattern4(
          result[1].trim().split(" "), // ["1//1", "2//2", "3//3"]
        );

      } else if ((result = this.facePattern2.exec(line)) !== null) {
        //Value of result:
        //["f 1/1 2/2 3/3", "1/1 2/2 3/3"...]

        //Set the data for this face
        this.setDataForCurrentFaceWithPattern2(
          result[1].trim().split(" "), // ["1/1", "2/2", "3/3"]
        );

      } else if ((result = this.facePattern1.exec(line)) !== null) {
        //Value of result
        //["f 1 2 3", "1 2 3"...]

        //Set the data for this face
        this.setDataForCurrentFaceWithPattern1(
          result[1].trim().split(" "), // ["1", "2", "3"]
        );

        //Define a mesh or an object
        //Each time this keyword is analysed, create a new Object with all data for creating a babylonMesh
      } else {
        //If there is another possibility
        console.log("Unhandled expression at line : " + line);
      }

    }
    const geometry = new StandradGeometry();
    const position = [];
    this.wrappedPositionForBabylon.forEach(po => {
      position.push(po.x);
      position.push(po.y);
      position.push(po.z);
    })

    const normal = [];
    this.wrappedNormalsForBabylon.forEach(po => {
      normal.push(po.x);
      normal.push(po.y);
      normal.push(po.z);
    })
    const positionBuffer = new Float32Array(position);
    const normalBuffer = new Float32Array(normal);
    const indexBuffer = new Uint16Array(this.indicesForBabylon);
    geometry.bufferDatas.position = new Float32BufferData(positionBuffer);
    const useGeneraetNormal = true;
    if (useGeneraetNormal) {
      geometry.bufferDatas.normal = new Float32BufferData(generateNormalFromPostion(positionBuffer));
    } else {
      geometry.bufferDatas.normal = new Float32BufferData(normalBuffer);
    }
    geometry.bufferDatas.index = new Uint16BufferData(indexBuffer);
    console.log('indexlength:' + indexBuffer.length);
    console.log('positionBuffer:' + positionBuffer.length);
    geometry.layout = {
      dataInfo: defaultGeometryLayoutDataInfo,
      drawCount: indexBuffer.length,
      drawFrom: 0,
      indexDraw: true,
    }

    return geometry;
  }
}