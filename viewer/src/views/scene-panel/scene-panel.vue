<template>
  <div class="scene-panel">
    <ObjectPanel v-if="!true"/>
    <div class="panel-title">Scene explorer
      <button @click="sync">sync</button>
      <button @click="hide">hide</button>
    </div>
    <nav class="scene-nav">
      <div v-for="navitem in nav" :key="navitem"
      :class="{'current-nav': navitem===currentNav}"
      @click="currentNav = navitem"
      >{{navitem}}</div>
    </nav>
    <div class="view-wrap"  v-if="sceneView">
      <NodeView v-if="currentNav === 'hierarchy'" 
      :view="sceneView.root" 
      @nodeChange="catchChange"/>
      <GeometryViewPanel v-if="currentNav === 'geometry'" 
      :view="sceneView" 
      />
      <MaterialViewPanel v-if="currentNav === 'material'" 
      :view="sceneView" 
      />
    </div>
    <div class="render-info">
      <div class="panel-title">RenderInfo</div>
      <div v-if="renderView" class="render-info-group">
        <div>
          activeProgramCount: {{renderView.compiledPrograms}}
        </div>
        <div>
          programswitch: {{renderView.programSwitchCount}}
        </div>
        <div>
          drawcall: {{renderView.drawcall}}
        </div>
        <div>
          uniformUpload: {{renderView.uniformUpload}}
        </div>
        <div>
          faceDraw: {{renderView.faceDraw}}
        </div>
        <div>
          vertexDraw: {{renderView.vertexDraw}}
        </div>
      </div>
      <div v-else class="render-info-group">
        sync scene to get synced render info stat
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { SceneView } from "../../model/scene-view";
import { RenderView } from "../../model/render-view";
import GeometryViewPanel from './geometry-view.vue';
import MaterialViewPanel from './material-view.vue';
import ObjectPanel from "../object-panel/object-panel.vue";
import { GLApp } from "../../application";
import NodeView from "./scene-node-view.vue";
import { Observer } from "../../../../src/core/observable";
import { RenderEngine } from "../../../../src/artgl";

@Component({
  components: {
    NodeView,
    ObjectPanel,
    GeometryViewPanel,
    MaterialViewPanel
  }
})
export default class ScenePanel extends Vue {
  sceneView: SceneView = null;
  renderView: RenderView = null;
  afterObs:Observer<RenderEngine>

  nav = ['hierarchy', 'technique','geometry','material'];
  currentNav = 'hierarchy'
  $store: any;

  sync() {
    this.sceneView = SceneView.create(GLApp.scene);
    this.renderView = RenderView.create(GLApp.engine);
    if(this.afterObs){
      GLApp.afterRender.remove(this.afterObs);
    }
    this.afterObs = GLApp.afterRender.add((engine:RenderEngine)=>{
      this.renderView.updateFrameInfo(engine);
    });
  }

  async hide(){
    this.$store.state.showScenePanel = false;
    await this.$nextTick()
    GLApp.notifyResize();
  }

  beforeDestroy(){
    if(this.afterObs){
      GLApp.afterRender.remove(this.afterObs);
    }
  }

  async catchChange(info) {
    if (info.type === "delete") {
      SceneView.deleteNode(info.id, GLApp.scene);
    } else if (info.type === "load") {
      await SceneView.loadObj(info.id, GLApp.scene);
    } else {
      console.log("unkown change");
      console.log(info);
    }
    this.sync();
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
}

.scene-panel {
  border: 1px solid #ddd;
  width: 300px;
  font-size: 14px;
}

.view-wrap {
  height: calc(100% - 200px);
  overflow-y: scroll;
  border: 1px solid #ddd;
}

.scene-nav{
  display: flex;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  >div{
    padding: 3px;
    cursor: pointer;
    &:hover{
      color: #36a0e3;
    }
  }
  >.current-nav{
    color: #36a0e3;
  }
}

.render-info{
  font-size: 12px
}

.render-info-group{
  padding-left: 10px;
}
</style>
