<template>
  <NodeWrap 
  :node="view"
  :boardInfo="boardInfo"
  @updateviewport = "reEmit"
  >
  <button @click="actualSize">actual size</button>
  <button>default size</button>
  </NodeWrap>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NodeWrap from '../node-view.vue';

@Component({
  components:{
    NodeWrap
  }
})
export default class RenderTargetNodeView extends Vue {
@Prop() view;
@Prop() boardInfo;

reEmit(node){
  this.$emit("updateviewport", node)
}

actualSize(){
  this.$emit("actualSize", this.view)
}

}
</script>

<style scoped lang="scss">

</style>
