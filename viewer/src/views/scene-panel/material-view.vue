<template>
  <div class="material-view">
    <div v-if="materiallist.length===0">no material found</div>
    <div v-for="material in materiallist" :key="material.uuid">
      <span>{{material.name}}-{{material.uuid.slice(0, 6)}}</span>

      <div class="channel-detail" v-if="expandDetail">
        <!-- <ChannelEditor v-for ="bufferinfo in material.xxx"
        :key="bufferinfo.name"
        />-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { SceneView, MaterialView } from "../../model/scene-view";
import ChannelEditor from "./channel-editor.vue";

@Component({
  components: {
    ChannelEditor
  }
})
export default class materialViewPanel extends Vue {
  @Prop() view?: SceneView;

  expandDetail = true;

  get materiallist() {
    const list: any = [];
    this.view!.materials.forEach(mat => {
      list.push(mat);
    });
    return list;
  }
}
</script>

<style scoped lang="scss">
</style>
