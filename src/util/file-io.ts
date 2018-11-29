export function downloadStringAsFile(content: string){

}

async function getStringContentFromFile(file) {
  const reader = new FileReader();
  return new Promise<string>(function (resolve, _) {
    reader.onload = function (e) {
      const str = reader.result;
      resolve(str as string);
    };
    reader.readAsText(file);
  });
}

export function openFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    const func = (e) => {
      resolve(e.target.files[0])
    }
    input.addEventListener('change', func);
    input.click();
  })
}

export async function loadStringFromFile() {
  const file = await openFile();
  const str = await getStringContentFromFile(file);
  return str;
}
