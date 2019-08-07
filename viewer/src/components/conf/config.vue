<template>
  <div class="conf">
    <Folder :config="config" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Folder from "./folder.vue";
@Component({
  components: { Folder }
})
export default class ConfigPanel extends Vue {
  @Prop({ required: true }) config: any;
}
</script>

<style lang="scss" scoped>
.conf {
  font-size: 12px;
  width: 300px;
}
</style>

