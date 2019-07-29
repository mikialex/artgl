<template>
  <div class="shader-graph">
    <div class="editor">
      <div>
        <button @click="addUniform">uniform</button>
        <button>attribute</button>
      </div>
      <GraphView>
        <DAGNodeView
        v-for="node in nodes"
        :key="node.uuid"
        :node ="node"
        >
          test
        </DAGNodeView>
      </GraphView>
    </div>

    <div class="viewer">
      <h1>viewer</h1>
      <button v-if="showCode" @click="showCode = false">canvas</button>
      <button v-else  @click="codeGen">view generated code </button>
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
import {ShaderApp} from '../shader-application';
import { injectFragmentShaderHeaders, GLDataType } from '../../../src/webgl/shader-util';
import { ShaderGraph, uniform } from '../../../src/artgl';
import DAGNodeView from '../components/graph/dag-node.vue';
import GraphView from '../components/graph/graph-viewer.vue';
import { ShaderNode } from '../../../src/shader-graph/shader-node';
import { GraphBoardInfo } from '../model/graph-view'

@Component({
  components:{
    DAGNodeView
  }
})
export default class ShaderEditor extends Vue {
  showCode:boolean = false;
  graph: ShaderGraph = null;
  codeGenResult: string = "";

  board: GraphBoardInfo = {
    width: 0,
    height: 0,
    transformX :0,
    transformY :0,
  }

  nodes: ShaderNode[] = [];

  mounted(){
    ShaderApp.init(this.$el.querySelector("#shader-editor-canvas"));
    this.graph = ShaderApp.shader.graph;
    // this.graphView = GraphView.createFromShaderGraph(ShaderApp.graph);
    console.log(this.graph)
  }

  codeGen(){
    this.showCode = true;
    // const result = ShaderApp.graph.compile();
    // this.codeGenResult = injectFragmentShaderHeaders(result, result.fragmentShaderString);
  }

  addUniform(){
    this.nodes.push(uniform("unnamed", GLDataType.float))
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
