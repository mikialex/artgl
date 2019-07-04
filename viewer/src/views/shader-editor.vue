<template>
  <div class="shader-graph">
    <div class="editor">
      <GraphViewer v-if="graphView" :graphview="graphView"/>
    </div>

    <div class="viewer">
      <h1>viewer</h1>
      <button v-if="showCode" @click="showCode = false">canvas</button>
      <button v-else  @click="codeGen">codegen result</button>
      <button @click="updateTechnique">updateTechnique</button>
      <div v-show="showCode" class="code-result">
        <pre>{{codeGenResult}}</pre>
      </div>
      <div class="canvas-wrap" v-show="!showCode" 
      @mouseenter="start"
      @mouseleave="end">
        <canvas id="shader-editor-canvas"></canvas>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import GraphViewer from '../components/graph-viewer/graph-viewer.vue';
import { GraphView } from '../model/graph-view';
import {ShaderApp} from '../shader-application';
import { injectFragmentShaderHeaders } from '../../../src/webgl/shader-util';

@Component({
  components:{
    GraphViewer
  }
})
export default class ShaderEditor extends Vue {
  showCode:boolean = false;
  graphView: GraphView = null;
  codeGenResult: string = "";

  mounted(){
    ShaderApp.init(this.$el.querySelector("#shader-editor-canvas"));
    this.graphView = GraphView.createFromShaderGraph(ShaderApp.graph);
    console.log(this.graphView)
  }

  codeGen(){
    this.showCode = true;
    // const result = ShaderApp.graph.compile();
    // this.codeGenResult = injectFragmentShaderHeaders(result, result.fragmentShaderString);
  }

  updateTechnique(){
    ShaderApp.updateShader();
  }

  start(){
    ShaderApp.start();
  }

  end(){
    ShaderApp.canvasRun = false;
  }

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
  position: relative;
}

.viewer {
  width: 40%;
}

.canvas-wrap{
  border: 1px solid #ddd;
  width: 100%;
  height: 100%;
  > canvas{
    width: 100%;
    height: 100%;
  }
}

h1 {
  margin: 0px;
  font-size: 20px;
}

.code-result{
  overflow: scroll;
}
</style>
