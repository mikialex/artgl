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
  node1.connectTo(node2);
  
  expect(node2.fromNodes.size).toBe(1);
  expect(node1.toNodes.size).toBe(1);

  node1.disconnectTo(node2);

  expect(node2.fromNodes.size).toBe(0);
  expect(node1.toNodes.size).toBe(0);

});

test('dag clear all', () => {
  const node1 = new DAGNode();
  const node2 = new DAGNode();
  const node3 = new DAGNode();
  node1.connectTo(node3);
  node2.connectTo(node3);
  node3.clearAllFrom();

  expect(node3.fromNodes.size).toBe(0);
  expect(node2.toNodes.size).toBe(0);
  expect(node1.toNodes.size).toBe(0);
});


test('dag dep sort', () => {
  const node1 = new DAGNode();
  const node2 = new DAGNode();
  const node3 = new DAGNode();
  node1.connectTo(node2);
  node2.connectTo(node3);
  node1.connectTo(node3);

  const list = node3.getTopologicalSortedList();
  expect(list.length).toBe(3);
  expect(list).toStrictEqual([node1, node2, node3])
  
});

test('dag graph contains cycle', () => {
  const node1 = new DAGNode();
  const node2 = new DAGNode();
  const node3 = new DAGNode();
  node1.connectTo(node2);
  node2.connectTo(node3);
  node3.connectTo(node1);

  function tryCatchCycle() {
    node1.getTopologicalSortedList()
  }

  expect(tryCatchCycle).toThrow('node graph contains cycles.');
});

