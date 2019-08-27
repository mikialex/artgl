<template>
  <div class="geometry-view">
    <div v-for="geometry in geometrylist"
    :key="geometry.uuid"
    > 
      <span>
        {{geometry.name}}-{{geometry.uuid.slice(0, 6)}}
      </span>
      
      <!-- <div class="buffer-detail" v-if="expandDetail">
        <div v-for ="bufferinfo in geometry._bufferDatum"
        :key="bufferinfo.name"
        >
        {{bufferinfo.name}} - {{Math.ceil(bufferinfo.dataByteSize / 1024 * 10)/ 10}}KB
        </div>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Scene } from "../../../../src/artgl";

@Component({
  components: {
  }
})
export default class GeometryViewPanel extends Vue {
  @Prop() scene!: Scene

  expandDetail = true;

  get geometrylist(){
    const list: any = [];
    this.scene._geometries.forEach(geo =>{
      list.push(geo);
    })
    return list;
  }
}
</script>

<style scoped lang="scss">
.buffer-detail{
  padding-left: 10px;
  background: #eee;
}

</style>
