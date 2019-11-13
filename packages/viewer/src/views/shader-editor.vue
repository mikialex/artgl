<template>
  <div class="shader-graph">
    <div class="editor">
      <button @click="layout">relayout</button>
      <div>
        <button @click="addUniform">uniform</button>
        <button>attribute</button>
      </div>
      <div style="position: absolute; top:0px; width: 100%;height: 100%">
        <LineHUDCanvas 
        :nodes="nodes"
        :nodesLayoutMap ="nodesLayoutMap"
        :boardInfo="board" />
        <GraphView :board="board">
          <DAGNodeView
            v-for="nodeView in viewNodes"
            :key="nodeView.node.uuid"
            :node="nodeView.node"
            :layout="nodeView.layout"
            :boardInfo="board"
            @updateViewport="updateViewport(nodeView)"
          >
            <ShaderFunctionNodeView
              v-if="isShaderFunctionNode(nodeView.node)"
              :node="nodeView.node"
              :layout="nodeView.layout"
              @updateSize="updateViewport"
            />
          </DAGNodeView>
        </GraphView>
      </div>
    </div>

    <div class="viewer">
      <h1>viewer</h1>
      <button v-if="showCode" @click="showCode = false">canvas</button>
      <button v-else @click="codeGen">view generated code</button>
      <button @click="updateTechnique">updateTechnique</button>
      <div v-show="showCode" class="code-result">
        <pre>{{codeGenResult}}</pre>
      </div>
      <div class="canvas-wrap" v-show="!showCode" @mouseenter="start" @mouseleave="end">
        <canvas id="shader-editor-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ShaderApplication } from "../shader-application";
import {
  injectFragmentShaderHeaders,
} from "artgl/src/webgl/shader-util";
import {
  ShaderGraph,
  uniform,
  DAGNode,
  TSSAOShading,
  Shading
} from "artgl/src/artgl";
import DAGNodeView from "../components/graph/dag-node.vue";
import ShaderFunctionNodeView from "../components/graph/nodes/shader-function-node.vue";
import GraphView from "../components/graph/graph-viewer.vue";
import { ShaderNode, ShaderFunctionNode } from "artgl/src/shader-graph/shader-node";
import LineHUDCanvas from "./line-hud-canvas.vue";
import {
  GraphBoardInfo,
  NodeLayout,
  ViewNode,
  layoutGraph
} from "../model/graph-view";
import { Nullable } from "artgl/src/type";
import { GLDataType } from "artgl/src/core/data-type";

@Component({
  components: {
    DAGNodeView,
    GraphView,
    LineHUDCanvas,
    ShaderFunctionNodeView
  }
})
export default class ShaderEditor extends Vue {
  showCode: boolean = false;
  graph: Nullable<ShaderGraph> = null;
  codeGenResult: string = "";

  board: GraphBoardInfo = {
    width: 0,
    height: 0,
    transformX: 0,
    transformY: 0,
    scale: 1,
  };

  viewNodes: ViewNode[] = [];

  get nodes(){
    return this.viewNodes.map(vn => vn.node)
  }

  get nodesLayoutMap(){
    const map = new Map();
    this.viewNodes.forEach(vn=>{
      map.set(vn.node, vn.layout)
    })
    return map;
  }

  $shaderApp?: ShaderApplication

  mounted() {
    const canvas = this.$el.querySelector("#shader-editor-canvas") as HTMLCanvasElement;
    Vue.prototype.$shaderApp = new ShaderApplication(canvas);
    this.graph = this.$shaderApp!.shader.graph;

    this.board.width = canvas.clientWidth;
    this.board.height = canvas.clientHeight;

    const tssaoShading = new TSSAOShading();
    const tssaoShader = new Shading().decorate(tssaoShading);
    tssaoShader.getProgramConfig(false);
    this.viewNodes = tssaoShader.graph.nodes.map(node => {
      return {
        node,
        layout: new NodeLayout()
      };
    });
    this.layout(tssaoShader);
    // this.graphView = GraphView.createFromShaderGraph(ShaderApp.graph);
    console.log(this.graph);
  }

  layout(tssaoShader: Shading) {
    const map: any = {};
    this.viewNodes.forEach(node => {
      map[node.node.uuid] = node.layout;
    });
    layoutGraph(tssaoShader.graph.fragmentRoot, map);
  }

  updateViewport(view: ViewNode) {
    // console.log("upd");
  }

  isShaderFunctionNode(node: DAGNode) {
    return node instanceof ShaderFunctionNode;
  }

  codeGen() {
    this.showCode = true;
    // const result = ShaderApp.graph.compile();
    // this.codeGenResult = injectFragmentShaderHeaders(result, result.fragmentShaderString);
  }

  addUniform() {
    this.viewNodes.push({
      node: uniform("unnamed", GLDataType.float),
      layout: new NodeLayout()
    });
  }

  updateTechnique() {
    this.$shaderApp!.updateShader();
  }

  start() {
    this.$shaderApp!.start();
  }

  end() {
    this.$shaderApp!.canvasRun = false;
  }
}
</script>


<style lang="scss" scoped>
.shader-graph {
  display: flex;
  height: calc(100vh - 40px);
  border-top: 1px solid #ddd;
}

.editor {
  width: 60%;
  height: 100%;
  border: 1px solid #ddd;
  position: relative;
}

.viewer {
  width: 40%;
}

.canvas-wrap {
  border: 1px solid #ddd;
  width: 100%;
  height: 100%;
  > canvas {
    width: 100%;
    height: 100%;
  }
}

h1 {
  margin: 0px;
  font-size: 20px;
}

.code-result {
  overflow: scroll;
}
</style>
