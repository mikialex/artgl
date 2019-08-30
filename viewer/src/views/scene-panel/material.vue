<template>
  <div class="material">
    <div class="title">
      <span>Material: {{material.name}}</span>
      <span class="trival">{{material.uuid.slice(0, 8)}}</span>
    </div>

    <div class="detail">
      <ChannelEditor v-for="channel in channels" :key="channel.name" />
      <button @click="addChannel">add Channel</button>
    </div>
    <button @click="deleteSelf">delete</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ChannelEditor from "./channel-editor.vue";
import { Scene, Material, Vector3 } from "../../../../src/artgl";

@Component({
  components: {
    ChannelEditor
  }
})
export default class MaterialPanel extends Vue {
  @Prop() material!: Material;

  expandDetail = true;
  channelUpdate = 1;

  get channels() {
    const a = this.channelUpdate;
    return Array.from(this.material._channels);
  }

  addChannel() {
    this.channelUpdate++;
    this.material.setChannelColor("test" + Math.random(), new Vector3());
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
