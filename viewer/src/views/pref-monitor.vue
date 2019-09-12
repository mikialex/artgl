<template>
  <div>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Framer } from '../../../src/artgl';
import { Observer } from '../../../src/core/observable';
@Component({
})
export default class PrefMonitor extends Vue {
  @Prop() framer!: Framer

  obs!: Observer<number>

  keepHistoryCount = 100;

  get stepWidth(){
    return this.$el.querySelector("canvas")!.width / this.keepHistoryCount;
  }

  mounted(){
    const canvas = this.$el.querySelector("canvas")!;
    const ctx = canvas.getContext("2d")!;

    this.obs = this.framer.onFrameEnd.add((time)=>{

      // move the old
      ctx.drawImage(canvas,
      this.stepWidth, 0, canvas.width - this.stepWidth, canvas.height,
      0, 0, canvas.width - this.stepWidth, canvas.height);

      // create the new
      // ctx.fillRect(
      //   canvas,
      // )

    })
    
  }


}
</script>