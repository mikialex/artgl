<template>
  <div class="viewer">
    <ScenePanel v-if="this.$store.state.showScenePanel"/>
    <ViewerCanvas />
    <ConfigPanel 
     v-if="this.$store.state.showConfigPanel"
    :appConfig="appConf"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ConfigPanel from './config-panel.vue'
import ScenePanel from './scene-panel/scene-panel.vue'
import ObjectPanel from './object-panel/object-panel.vue'
import ViewerCanvas from './viewer-canvas.vue'
import { RenderConfig } from '../components/conf/interface';
import { Application } from '../application';

@Component({
  components:{
    ConfigPanel, ScenePanel, ViewerCanvas, ObjectPanel
  }
})
export default class Viewer extends Vue {
  $viewer?: Application
  
  mounted(){
    this.appConf = this.$viewer!.pipeline.config!;
  }

  appConf: RenderConfig = {
    name: 'root',
    type: 'folder',
    value: []
  };

}
</script>

<style scoped lang="scss">

.viewer{
  display:flex;
  height: calc(100vh - 40px);
}
</style>
