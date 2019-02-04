<template>
  <div class="scene-panel">
    
    <ObjectPanel v-if="!true"/>
    <div class="panel-title">
      Scene explorer
    </div>
    <button @click="inspect">inspect</button>
    <button @click="loadObj">load obj</button>
    <div class="tree-view-wrap">
      <NodeView 
      v-if="sceneView" 
      :view="sceneView.root" 
      @deleteNode="deleteNode"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SceneView } from '../../model/scene-view';
import ObjectPanel from '../object-panel/object-panel.vue'
import {GLApp} from '../../application';
import NodeView from './scene-node-view.vue';
import { OBJLoader } from '../../../../src/artgl';
import {loadStringFromFile} from '../../../../src/util/file-io';

const objLoader = new OBJLoader();

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

  deleteNode(nodeId){
    this.sceneView.deleteNode(nodeId, GLApp.scene);
    this.inspect();
  }

  async loadObj(){
    const objstr = await loadStringFromFile();
    if(!objstr && objstr.length === 0){
      return ;
    }
    const result = objLoader.parse(objstr);
    GLApp.addGeomotry(result);
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
