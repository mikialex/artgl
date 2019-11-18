<template>
  <div class="scene-panel">
    <ObjectPanel v-if="!true" />
    <div class="panel-title">
      Scene explorer
      <span @click="hide">
        <font-awesome-icon icon="minus-square" />
      </span>
    </div>
    <nav class="scene-nav">
      <div
        v-for="navitem in nav"
        :key="navitem"
        :class="{'current-nav': navitem===currentNav}"
        @click="currentNav = navitem"
      >{{navitem}}</div>
    </nav>
    <div class="view-wrap" v-if="sceneView">
      <NodeView v-if="currentNav === 'hierarchy'" :node="sceneView.root" />
      <GeometryViewPanel v-if="currentNav === 'geometry'" :scene="sceneView" />
      <MaterialViewPanel v-if="currentNav === 'material'" :scene="sceneView" />
    </div>
    <div class="render-info">
      <div class="panel-title">RenderInfo</div>
      <div v-if="renderView" class="render-info-group">
        <div>activeProgramCount: {{renderView.compiledPrograms}}</div>
        <div>program switch: {{renderView.programSwitchCount}}</div>
        <div>drawcall: {{renderView.drawcall}}</div>
        <div>uniformUpload: {{renderView.uniformUpload}}</div>
        <div>faceDraw: {{renderView.faceDraw}}</div>
        <div>vertexDraw: {{renderView.vertexDraw}}</div>
      </div>
      <div v-else class="render-info-group">sync scene to get synced render info stat</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { RenderView } from "../../model/render-view";
import GeometryViewPanel from "./geometry-view.vue";
import MaterialViewPanel from "./material-view.vue";
import ObjectPanel from "../object-panel/object-panel.vue";
import NodeView from "./scene-node-view.vue";
import { RenderEngine, Scene, Observer, Nullable } from "artgl";
import { Application } from "../../application";

@Component({
  components: {
    NodeView,
    ObjectPanel,
    GeometryViewPanel,
    MaterialViewPanel
  }
})
export default class ScenePanel extends Vue {
  sceneView: Nullable<Scene> = null;
  renderView: Nullable<RenderView> = null;
  afterObs: Nullable<Observer<RenderEngine>> = null;
  $viewer!: Application;

  nav = ["hierarchy", "shading", "geometry", "material"];
  currentNav = "hierarchy";
  $store: any;

  mounted() {
    setTimeout(() => {
      this.sceneView = this.$viewer.scene;
      this.renderView = RenderView.create(this.$viewer.engine);
      if (this.afterObs) {
        this.$viewer.afterRender.remove(this.afterObs);
      }
      this.afterObs = this.$viewer.afterRender.add((engine: RenderEngine) => {
        this.renderView!.updateFrameInfo(engine);
      });
    }, 1);
  }

  async hide() {
    this.$store.state.showScenePanel = false;
    await this.$nextTick();
    this.$viewer.notifyResize();
  }

  beforeDestroy() {
    if (this.afterObs) {
      this.$viewer.afterRender.remove(this.afterObs);
    }
  }
}
</script>

<style scoped lang="scss">
.panel-title {
  font-weight: bold;
  padding: 5px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-content: center;
  >span{
    font-size: 16px;
    &:hover{
      color: rgb(53, 149, 238);
    }
    &:active{
      color: rgb(13, 87, 156);
    }
  }
}

.scene-panel {
  border: 1px solid #ddd;
  width: 300px;
  min-width: 300px;
  max-width: 300px;
  font-size: 14px;
}

.view-wrap {
  height: calc(100% - 200px);
  overflow: scroll;
  border: 1px solid #ddd;
}

.scene-nav {
  display: flex;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  > div {
    padding: 3px;
    cursor: pointer;
    &:hover {
      color: #36a0e3;
    }
  }
  > .current-nav {
    color: #36a0e3;
  }
}

.render-info {
  font-size: 12px;
}

.render-info-group {
  padding-left: 10px;
}
</style>
