<template>
  <div class="viewer">
    <ScenePanel />
    <ViewerCanvas />
    <ConfigPanel />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ConfigPanel from './config-panel.vue'
import ScenePanel from './scene-panel.vue'
import ViewerCanvas from './viewer-canvas.vue'
@Component({
  components:{
    ConfigPanel, ScenePanel, ViewerCanvas
  }
})
export default class Viewer extends Vue {
  
}
</script>

<style scoped lang="scss">

.viewer{
  display:flex;
  height: calc(100vh - 40px);
}
</style>
