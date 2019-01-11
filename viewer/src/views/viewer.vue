<template>
  <div class="viewer">
    <div class="canvas-wrap">
      Canvas area
    </div>
    <div class="config-panel">
     <Config :config="demoConfig"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Config from '../components/conf/config.vue';
import demoConfig from '../conf';
@Component({
  components:{
    Config
  }
})
export default class Viewer extends Vue {
  demoConfig = demoConfig
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

.config-panel{
  display: flex;
  justify-content: center;
  border: 1px solid #ddd;
}

.viewer{
  display:flex;
  height: calc(100vh - 40px);
}
</style>
