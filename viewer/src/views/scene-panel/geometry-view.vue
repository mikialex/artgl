<template>
  <div class="geometry-view">
    <div v-for="geometry in geometrylist"
    :key="geometry.uuid"
    >
      {{geometry.uuid.slice(0, 6)}}
      <div class="buffer-detail">
        <div v-for ="bufferinfo in geometry.buffers"
        :key="bufferinfo.name"
        >
        {{bufferinfo.name}} - {{Math.ceil(bufferinfo.dataByteSize / 1024 * 10)/ 10}}KB
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { SceneView, GeometryView } from "../../model/scene-view";

@Component({
  components: {
  }
})
export default class GeometryViewPanel extends Vue {
  @Prop() view: SceneView

  get geometrylist(){
    const list = [];
    this.view.geometries.forEach(geo =>{
      list.push(geo);
    })
    return list;
  }
}
</script>

<style scoped lang="scss">
.buffer-detail{
  padding-left: 10px;
}
</style>
