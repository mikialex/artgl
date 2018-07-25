export class EntityList<T>{

}


export class EntityIdList<T>{
  list: EntityList<T>
  id: number[] = [];

  getEntityID(entity: T) {
    return 0;
  }

  push(entity: T) {
    this.id.push(this.getEntityID(entity));
  }

  
}