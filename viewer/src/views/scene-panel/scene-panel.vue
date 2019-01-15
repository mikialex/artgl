<template>
  <div class="scene-panel">
    
    <ObjectPanel v-if="false"/>
    <div class="panel-title">
      Scene explorer
    </div>
    <button @click="inspect">inspect</button>
    <div class="tree-view-wrap">
      <NodeView v-if="sceneView" :view="sceneView.root" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SceneView } from '../../model/scene-view';
import ObjectPanel from '../object-panel/object-panel.vue'
import {GLApp} from '../../application';
import NodeView from './scene-node-view.vue';
@Component({
  components:{
    NodeView, ObjectPanel
  }
})
export default class ScenePanel extends Vue {
  sceneView: SceneView = null;
  inspect(){
    this.sceneView = SceneView.create(GLApp.scene);
    console.log(this.sceneView);
  }
}
</script>

<style scoped lang="scss">
.panel-title{
  font-weight: bold;
  padding: 5px;
  font-size: 16px;
}

.scene-panel{
  border: 1px solid #ddd;
  width: 300px;
}

.tree-view-wrap{
  height: calc(100% - 200px);
  overflow-y: scroll;
}

</style>
