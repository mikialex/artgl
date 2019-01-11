<template>
  <div class="scene-panel">
    <div class="panel-title">
      Scene explorer
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component({
  components:{
    
  }
})
export default class ScenePanel extends Vue {
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
}

</style>
