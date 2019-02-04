<template>
  <div class="scene-panel">
    <ObjectPanel v-if="!true"/>
    <div class="panel-title">Scene explorer
      <button @click="sync">sync</button>
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
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { SceneView } from "../../model/scene-view";
import GeometryViewPanel from './geometry-view.vue';
import ObjectPanel from "../object-panel/object-panel.vue";
import { GLApp } from "../../application";
import NodeView from "./scene-node-view.vue";

@Component({
  components: {
    NodeView,
    ObjectPanel,
    GeometryViewPanel
  }
})
export default class ScenePanel extends Vue {
  sceneView: SceneView = null;

  nav = ['hierarchy', 'technique','geometry','material'];
  currentNav = 'hierarchy'

  sync() {
    this.sceneView = SceneView.create(GLApp.scene);
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
  font-size: 15px;
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
</style>
