<template>
  <div class="editor">
      <button @click="layout">relayout</button>
      <div>
        <button @click="addUniform">uniform</button>
        <button>attribute</button>
      </div>
      <GraphView :board="this.board">
        <DAGNodeView
          v-for="nodeView in nodes"
          :key="nodeView.node.uuid"
          :node="nodeView.node"
          :layout="nodeView.layout"
        >test</DAGNodeView>
      </GraphView>
    </div>
</template>
