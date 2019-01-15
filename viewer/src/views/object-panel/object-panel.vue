<template>
  <div class="object-panel">
    <button>X</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component({
  components:{
  }
})
export default class ObjectPanel extends Vue {
}
</script>

<style scoped lang="scss">
.object-panel{
  position: fixed;
  top:80px;
  left: 320px;
  width: 300px;
  height: calc(100vh - 200px);
  background: #fff;
  z-index:1;
  border-radius: 5px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.13);
}

</style>
