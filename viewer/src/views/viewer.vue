<template>
  <div class="viewer">
    <ScenePanel />
    <div class="canvas-wrap">
      Canvas area
    </div>
    <ConfigPanel />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ConfigPanel from './config-panel.vue'
import ScenePanel from './scene-panel.vue'
@Component({
  components:{
    ConfigPanel, ScenePanel
  }
})
export default class Viewer extends Vue {
  
}
</script>

<style scoped lang="scss">
.canvas-wrap{
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100vw - 300px);
  border: 1px solid #ddd;
}

.scene-panel{
  width: 300px;
  min-width: 300px;
  border: 1px solid #ddd;
}

.viewer{
  display:flex;
  height: calc(100vh - 40px);
}
</style>
