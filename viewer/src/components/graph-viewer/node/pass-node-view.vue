<template>
  <NodeWrap 
  :node="view"
  :boardInfo="boardInfo"
  @updateviewport = "reEmit"
  >
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
export default class PassNodeView extends Vue {
@Prop() view;
@Prop() boardInfo;

reEmit(node){
  this.$emit("updateviewport", node)
}

}
</script>

<style scoped lang="scss">

</style>
