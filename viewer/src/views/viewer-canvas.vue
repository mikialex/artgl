<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas"></canvas>
    <div class="command-bar">
      <button @click="run">run</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {GLApp} from '../application';

let engine;

@Component({
  components:{
  }
})
export default class ViewerCanvas extends Vue {
  isRuning:boolean;
  mounted(){
    const canvas = this.$el.querySelector('#viewer-canvas') as HTMLCanvasElement;
    GLApp.initialize(canvas);
  }

  run(){
    console.log('r')
  }

}
</script>


<style lang="scss" scoped>
.canvas-wrap{
  width: calc(100vw - 600px);
  border: 1px solid #ddd;
}

#viewer-canvas{
  width: 100%;
  height: calc(100% - 40px); 
}

.command-bar{
  border-top:1px solid #eee;
  height: 40px;
}

</style>
