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

test('dag connect and disconnect', () => {
  const node1 = new DAGNode();
  const node2 = new DAGNode();
  node1.connectTo("test", node2);

  expect(node1.getFromNode("test")).toBe(undefined);
  expect(node1.getToNode("test")).toBe(node2);
  expect(node2.getFromNode("test")).toBe(node1);
  expect(node2.getToNode("test")).toBe(undefined);

  node1.disconnectTo("test", node2);

  expect(node1.getFromNode("test")).toBe(undefined);
  expect(node1.getToNode("test")).toBe(undefined);
  expect(node2.getFromNode("test")).toBe(undefined);
  expect(node2.getToNode("test")).toBe(undefined);
});


