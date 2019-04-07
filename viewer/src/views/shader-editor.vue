<template>
  <div class="shader-graph">
    <div class="editor">
      <h1>editor</h1>
      <div>
        <GraphViewer :graphview="graphView"/>
      </div>
    </div>

    <div class="viewer">
      <h1>viewer</h1>
      <button v-if="showCode" @click="showCode = false">canvas</button>
      <button v-else  @click="showCode = true">codegen result</button>
      <div v-if="showCode">
        <pre>
          sdfj skdfj
        </pre>
      </div>
      <div class="canvas-wrap" v-else>
        <canvas></canvas>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import GraphViewer from '../components/graph-viewer/graph-viewer.vue';

@Component({
  components:{
    GraphViewer
  }
})
export default class ShaderEditor extends Vue {
  showCode:boolean = false;
}
</script>


<style lang="scss" scoped>
.shader-graph{
  display: flex;
  height: calc(100vh - 40px);
  border-top: 1px solid #ddd;
  
}


.editor{
  width: 60%;
  height:100%;
  border: 1px solid #ddd;
}

.viewer {
  width: 40%;
}

.canvas-wrap{
  border: 1px solid #ddd;
  width: 100%;
  height: 100%;
}

h1 {
  margin: 0px;
  font-size: 20px;
}
</style>
