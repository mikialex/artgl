<template>
  <canvas class="lines-hud"
  @mousewheel="zoom"
  ></canvas>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { GraphBoardInfo, CanvasGraphUI, NodeLayout } from "../model/graph-view";
import { DAGNode } from "artgl";

@Component({
  components: {}
})
export default class LineHUDCanvas extends Vue {
  viewer?: CanvasGraphUI;
  isRunning: boolean = true;

  @Prop({
    required: true
  })
  boardInfo?: GraphBoardInfo;

  @Prop({
    required: true
  })
  nodes?: DAGNode[];

  @Prop({
    required: true
  })
  nodesLayoutMap?:  Map<DAGNode, NodeLayout>;

  mounted() {
    this.viewer = new CanvasGraphUI(this.$el as HTMLCanvasElement, this.boardInfo!);
    window.addEventListener("resize", this.updateSize);
    window.requestAnimationFrame(this.draw);
    this.updateSize();
  }

  beforeDestroy() {
    this.isRunning = false;
  }

  zoom(e:MouseWheelEvent){
    const absX = (e.offsetX - this.boardInfo!.transformX) * this.boardInfo!.scale
    const absY = (e.offsetY - this.boardInfo!.transformY) * this.boardInfo!.scale
    console.log(absX, absY)
    const deltaScale = e.deltaY / 300;
    this.boardInfo!.scale += deltaScale;
    // this.boardInfo.transformX += absX * deltaScale
    // this.boardInfo.transformY += absY * deltaScale
  }

  updateSize() {
    const el = this.$el as HTMLCanvasElement;
    this.viewer!.width = el.clientWidth;
    this.viewer!.height = el.clientHeight;
    el.width = el.clientWidth;
    el.height = el.clientHeight;
  }

  draw() {
    this.viewer!.clear();
    this.viewer!.drawGrid();
    this.viewer!.drawViewNodes(this.nodes!, this.nodesLayoutMap!);
    if (this.isRunning) {
      window.requestAnimationFrame(this.draw);
    }
  }
}
</script>


<style lang="scss" scoped>
.lines-hud {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
}
</style>
