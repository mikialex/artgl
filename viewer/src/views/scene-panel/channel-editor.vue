<template>
  <div class="channel">
    <img src="" alt="">
    <button>upload</button>
    <button @click="deleteChannel">deleteChannel</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
export default class ChannelEditor extends Vue {
  deleteChannel = () => {
    this.$emit('deleteSelf');
  }
}

</script>

<style lang="scss" scoped>
.channel{
  background: #eee;
  margin: 4px;
  border-radius: 3px;
}

img{
  width: 40px;
  height: 40px;
  margin: 2px;
  border-radius: 3px;

}
</style>