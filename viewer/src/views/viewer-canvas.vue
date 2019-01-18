<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas"></canvas>
    <div v-if="!isRuning" class="stop-notation"> STOPPED </div>
    <div class="command-bar">
      <button @click="run" v-if="!isRuning">run</button>
      <button @click="stop" v-else>stop</button>
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
  isRuning:boolean = false;
  mounted(){
    const canvas = this.$el.querySelector('#viewer-canvas') as HTMLCanvasElement;
    GLApp.initialize(canvas);
    this.isRuning = GLApp.active;
  }

  beforeDestroy(){
    GLApp.unintialize();
  }

  run(){
    GLApp.run();
    this.isRuning = true;
  }

  stop(){
    GLApp.stop();
    this.isRuning = false;
  }

}
</script>


<style lang="scss" scoped>
.canvas-wrap{
  width: calc(100vw - 600px);
  border: 1px solid #ddd;
  position: relative;
}

#viewer-canvas{
  width: 100%;
  height: calc(100% - 40px); 
}

.command-bar{
  border-top:1px solid #eee;
  height: 40px;
}

.stop-notation{
  position: absolute;
  width:100%;
  height: calc(100% - 40px);
  top:0px;
  font-size: 20px;
  border: 3px solid rgb(235, 90, 90);
  color:  rgb(235, 90, 90);
  box-sizing: border-box;
}

</style>
