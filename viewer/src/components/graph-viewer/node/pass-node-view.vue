<template>
  <NodeWrap 
  :node="view"
  :boardInfo="boardInfo">

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

}
</script>

<style scoped lang="scss">

</style>
