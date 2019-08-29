<template>
  <div>
    <div class="title">
      <span>{{material.name}}-{{material.uuid.slice(0, 6)}}</span>
    </div>

    <div class="detail">

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ChannelEditor from "./channel-editor.vue";
import { Scene, Material } from "../../../../src/artgl";

@Component({
  components: {
    ChannelEditor
  }
})
export default class MaterialPanel extends Vue {
  @Prop() material!: Material;

  expandDetail = true;


}
</script>

<style scoped lang="scss">
</style>

<style lang="scss" scoped>
.title{

}
</style>
