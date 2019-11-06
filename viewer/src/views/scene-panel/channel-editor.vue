<template>
  <div class="channel">
    <button @click="uploadImg">upload</button>
    <button @click="deleteChannel">deleteChannel</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { loadImageFromFile } from "../../../../src/util/file-io";
import { Texture } from "../../../../src/artgl";

export default class ChannelEditor extends Vue {
  @Prop() name!: string;
  @Prop() texture!: Texture;

  src: any;

  deleteChannel = () => {
    this.$emit('deleteSelf', this.name);
  }

  uploadImg = async () => {
    const img = await loadImageFromFile()

    const appendImg = this.$el.querySelector('.channel-img')
    if(appendImg != null){
      appendImg.parentNode!.removeChild(appendImg)
    }
    img.className = 'channel-img'
    this.$el.appendChild(img);
    (img as any).style =`
    width:100px; height:100px;
    `

    this.$emit('uploadImage', this.name, img)
  }
}

</script>

<style lang="scss" scoped>
.channel{
  background: #eee;
  margin: 4px;
  border-radius: 3px;
}

// img{
//   width: 40px;
//   height: 40px;
//   margin: 2px;
//   border-radius: 3px;

// }
</style>