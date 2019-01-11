<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {initARTGL} from '../init';
@Component({
  components:{
  }
})
export default class ViewerCanvas extends Vue {
  mounted(){
    initARTGL(this.$el.querySelector('#viewer-canvas'));
  }

}
</script>


<style lang="scss" scoped>
.canvas-wrap{
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100vw - 600px);
  border: 1px solid #ddd;
}

#viewer-canvas{
  width: 100%;
  height: 100%; 
}

</style>
