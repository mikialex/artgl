import { DAGNode } from "../dag-node";


test('single dag traverse', () => {
  const node = new DAGNode();
  let count = 0;
  let visitedId = "";
  node.traverseDFS(n => {
    visitedId = n.uuid;
    count++;
  })
  expect(count).toBe(1);
  expect(visitedId).toBe(node.uuid);
});
