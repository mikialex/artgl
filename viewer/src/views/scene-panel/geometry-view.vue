<template>
  <div class="geometry-view">
    <div v-for="geometry in geometrylist"
    :key="geometry.uuid"
    > 
      <div class="title">
        {{geometry.constructor.name}}-{{geometry.uuid.slice(0, 6)}}
      </div>
      
      <div class="buffer-detail" v-if="expandDetail">
        <div v-for ="(bufferinfo, index) in geometry._bufferDatum"
        :key="bufferinfo.name"
        >
        {{index}} - {{Math.ceil(bufferinfo.dataSize / 1024 * 10)/ 10}}KB
        </div>
      </div>

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

.title{
  height: 30px;
  padding-left: 5px;
  display: flex;
  align-items: center;
}

</style>
