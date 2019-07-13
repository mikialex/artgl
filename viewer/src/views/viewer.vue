<template>
  <div class="viewer">
    <ScenePanel />
    <ViewerCanvas />
    <ConfigPanel :appConfig="appConf"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ConfigPanel from './config-panel.vue'
import ScenePanel from './scene-panel/scene-panel.vue'
import ObjectPanel from './object-panel/object-panel.vue'
import ViewerCanvas from './viewer-canvas.vue'
import {GLApp} from '../application';

@Component({
  components:{
    ConfigPanel, ScenePanel, ViewerCanvas, ObjectPanel
  }
})
export default class Viewer extends Vue {
  mounted(){
    const canvas = this.$el.querySelector('#viewer-canvas') as HTMLCanvasElement;
    GLApp.initialize(canvas);
    // this.appConf = GLApp.conf;
    console.log(GLApp.conf)
  }

  appConf = {
    name: 'root',
    type: 'folder',
    value: []
  };

  
  beforeDestroy(){
    GLApp.unintialize();
  }

}
</script>

<style scoped lang="scss">

.viewer{
  display:flex;
  height: calc(100vh - 40px);
}
</style>
