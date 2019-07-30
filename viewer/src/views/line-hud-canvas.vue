<template>
  <canvas class="lines-hud"></canvas>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { LinesHUD, ConnectionLine, GraphBoardInfo } from "../model/graph-view";

@Component({
  components: {}
})
export default class LineHUDCanvas extends Vue {
  HUD: LinesHUD;
  isRunning: boolean = true;

  @Prop({
    required: true
  })
  lines: ConnectionLine[];

  @Prop({
    required: true
  })
  boardInfo: GraphBoardInfo;

  mounted() {
    this.HUD = new LinesHUD(this.$el as HTMLCanvasElement);
    window.addEventListener("resize", this.updateSize);
    window.requestAnimationFrame(this.draw);
    this.updateSize();
  }

  beforeDestroy() {
    this.isRunning = false;
  }

  updateSize() {
    const el = this.$el as HTMLCanvasElement;
    this.HUD.width = el.clientWidth;
    this.HUD.height = el.clientHeight;
    el.width = el.clientWidth;
    el.height = el.clientHeight;
  }

  draw() {
    this.HUD.draw(this.lines, this.boardInfo);
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
