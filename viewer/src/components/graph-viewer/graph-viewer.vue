<template>
  <div class="graph-viewer">
    <PassNode 
    v-for="node in graphview.passNodes" 
    :key="node.uuid" 
    :view="node" 
    :boardInfo="board"/>

    <PassNode
      v-for="node in graphview.targetNodes"
      :key="node.uuid"
      :view="node"
      :boardInfo="board"
    />

    <svg class="connection" 
    :width="board.width + 'px'" 
    :height="board.height + 'px'">
      <path
        class="connect"
        v-for="line in lines"
        :key="line.id"
        :d="line.line"
        stroke="black"
        fill="transparent"
      ></path>
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { GraphView } from "../../model/graph-view";
import PassNode from "./node/pass-node-view.vue";
import NodeWrap from "./node-view.vue";

@Component({
  components: {
    PassNode,
    NodeWrap
  }
})
export default class GraphViewer extends Vue {
  @Prop() graphview: GraphView;

  board = {
    offsetX: 0,
    offsetY: 0,
    width: 10,
    height: 10
  };

  mounted() {
    this.board.offsetX = this.$el.getBoundingClientRect().left;
    this.board.offsetY = this.$el.getBoundingClientRect().top;
    this.board.width = this.$el.clientWidth;
    this.board.height = this.$el.clientHeight;
  }

  get lines() {
    let lines = [];
    this.graphview.passNodes.forEach(node => {
      lines = lines.concat(node.getConnectionLines(this.graphview));
    });
    this.graphview.targetNodes.forEach(node => {
      lines = lines.concat(node.getConnectionLines(this.graphview));
    });
    return lines;
  }
}
</script>

<style lang="scss" scoped>
.graph-viewer {
  pointer-events: none;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: calc(100% - 40px);
}

.connector {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: calc(100% - 40px);
  z-index: -10;
}
</style>
