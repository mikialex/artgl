<template>
  <div class="graph-viewer" tabindex="-1">
    <div style="transform-origin: top left;" :style="{
          transform,
        }">
      <slot></slot>
    </div>

    <div class="mask" v-if="showMove" @mousedown="startDrag"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Vector4 } from "artgl";
import { GraphBoardInfo } from "../../model/graph-view";

@Component({
  components: {}
})
export default class GraphViewer extends Vue {
  @Prop({ required: true }) board?: GraphBoardInfo;

  get transform() {
    return `translate(${this.board!.transformX}px, ${
      this.board!.transformY
    }px) scale(${this.board!.scale})`;
  }

  showMove = false;

  isDragging = false;
  originTransformX: number = 0;
  originTransformY: number = 0;
  screenOriginX: number = 0;
  screenOriginY: number = 0;
  startDrag(e: MouseEvent) {
    this.isDragging = true;
    this.screenOriginX = e.screenX;
    this.screenOriginY = e.screenY;
    this.originTransformX = this.board!.transformX;
    this.originTransformY = this.board!.transformY;
    window.addEventListener("mousemove", this.dragging);
    window.addEventListener("mouseup", e => {
      this.isDragging = false;
      window.removeEventListener("mousemove", this.dragging);
    });
  }

  dragging(e: MouseEvent) {
    this.board!.transformX =
      this.originTransformX + e.screenX - this.screenOriginX;
    this.board!.transformY =
      this.originTransformY + e.screenY - this.screenOriginY;
    this.$emit("updateAllViewport");
  }

  enableDragKeyboard(e: KeyboardEvent) {
    if (e.code === "Space") {
      this.showMove = true;
    }
  }

  disableDragKeyboard(e: KeyboardEvent) {
    if (e.code === "Space") {
      this.showMove = false;
    }
  }

  mounted() {
    this.updateBoard();
    window.addEventListener("resize", this.updateBoard);
    window.addEventListener("keydown", this.enableDragKeyboard);
    window.addEventListener("keyup", this.disableDragKeyboard);
  }

  beforeDestroy() {
    window.removeEventListener("resize", this.updateBoard);
    window.removeEventListener("keydown", this.enableDragKeyboard);
    window.removeEventListener("keyup", this.disableDragKeyboard);
  }

  updateBoard() {
    this.board!.width = this.$el.clientWidth;
    this.board!.height = this.$el.clientHeight;
    this.$emit("updateAllViewport");
  }
}
</script>

<style lang="scss" scoped>
.graph-viewer {
  pointer-events: none;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.connector {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: calc(100% - 40px);
  z-index: -10;
}

.mask {
  width: 100%;
  height: 100%;
  cursor: grab;
  top: 0px;
  left: 0px;
  position: absolute;
  pointer-events: auto;
}
</style>
