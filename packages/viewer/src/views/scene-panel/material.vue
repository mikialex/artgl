<template>
  <div class="material">
    <div class="title">
      <span>Material: {{material.name}}</span>
      <span class="trival">{{material.uuid.slice(0, 8)}}</span>
    </div>

    <div class="detail">
      <ChannelEditor 
      v-for="channel in channels" 
      :key="channel.name" 
      :name ="channel.name"
      :texture ="channel.value"
      @deleteSelf="deleteChannel"
      @uploadImage="updateChannalImage"

      />
      <button @click="addChannel">add Channel</button>
    </div>
    <button @click="deleteSelf">delete</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ChannelEditor from "./channel-editor.vue";
import { Scene, Material, Vector3, Texture, ChannelType } from "artgl";
import { TextureSource } from "@artgl/shared";

@Component({
  components: {
    ChannelEditor
  }
})
export default class MaterialPanel extends Vue {
  @Prop() material!: Material;

  expandDetail = true;
  channelUpdate = 1;

  updateChannalImage(channelName: string, img: HTMLImageElement){
    this.material.setChannelTexture(channelName, new Texture(TextureSource.fromImageElement(img)));
  }

  get channels() {
    const a = this.channelUpdate;
    const results: any =[];
    this.material._channels.forEach((value,key) =>{
      results.push({
        name: key, 
        value
      })
    })
    console.log(results)
    return results;
  }

  addChannel() {
    this.channelUpdate++;
    this.material.setChannelColor("test" + Math.random(), new Vector3());
  }

  deleteChannel(channelName: string){
    console.log(channelName)
    this.material.deleteChannel(channelName as ChannelType);
  }

  deleteSelf(){
    this.$emit("deleteSelf")
  }
}
</script>

<style scoped lang="scss">
</style>

<style lang="scss" scoped>
.material{
  padding: 5px;
}

.trival{
  font-size: 12px;
  color: #aaa;
  margin-left: 5px;
}

</style>
