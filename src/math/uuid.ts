let globalUUID = 0;

export function generateUUID(){
  return globalUUID++;
}