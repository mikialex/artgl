
function testFunctionCost(func: Function, testCount: number, prepareFunc: Function) {
  prepareFunc();
  let timeAll = performance.now();
  for (let i = 0; i < testCount; i++) {
    func();
  }
  timeAll = performance.now() - timeAll;
  return {
    average: timeAll / testCount,
    timeAll: timeAll
  }
}

