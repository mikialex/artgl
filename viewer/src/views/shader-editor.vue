<template>
  <div class="shader-graph">
    <div class="editor">
      <button @click="layout">relayout</button>
      <div>
        <button @click="addUniform">uniform</button>
        <button>attribute</button>
      </div>
      <div style="position: absolute; top:0px; width: 100%;height: 100%">
        <LineHUDCanvas :lines="lines" :boardInfo="board" />
        <GraphView :board="board">
          <DAGNodeView
            v-for="nodeView in nodes"
            :key="nodeView.node.uuid"
            :node="nodeView.node"
            :layout="nodeView.layout"
            :boardInfo="board"
            @updateViewport="updateViewport(nodeView)"
            @updateLine = "updateLine"
            ref="vueNodes"
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
import { Component, Prop, Vue, ProvideReactive } from "vue-property-decorator";
import { ShaderApp } from "../shader-application";
import {
  injectFragmentShaderHeaders,
  GLDataType
} from "../../../src/webgl/shader-util";
import {
  ShaderGraph,
  uniform,
  DAGNode,
  TSSAOShading,
  Shading
} from "../../../src/artgl";
import DAGNodeView from "../components/graph/dag-node.vue";
import ShaderFunctionNodeView from "../components/graph/nodes/shader-function-node.vue";
import GraphView from "../components/graph/graph-viewer.vue";
import { ShaderNode, ShaderFunctionNode } from "../../../src/shader-graph/shader-node";
import LineHUDCanvas from "./line-hud-canvas.vue";
import {
  GraphBoardInfo,
  NodeLayout,
  ViewNode,
  ConnectionLine,
  layoutGraph
} from "../model/graph-view";

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
  graph: ShaderGraph = null;
  codeGenResult: string = "";

  board: GraphBoardInfo = {
    width: 0,
    height: 0,
    transformX: 0,
    transformY: 0
  };

  @ProvideReactive() nodes: ViewNode[] = [];
  @ProvideReactive() lines: ConnectionLine[] = [];

  mounted() {
    const canvas = this.$el.querySelector("#shader-editor-canvas");
    ShaderApp.init(canvas as HTMLCanvasElement);
    this.graph = ShaderApp.shader.graph;

    this.board.width = canvas.clientWidth;
    this.board.height = canvas.clientHeight;

    const tssaoShading = new TSSAOShading();
    const tssaoShader = new Shading().decorate(tssaoShading);
    tssaoShader.getProgramConfig();
    this.nodes = tssaoShader.graph.nodes.map(node => {
      return {
        node,
        layout: {
          absX: 0,
          absY: 0,
          width: 200,
          height: 200
        }
      };
    });
    this.layout(tssaoShader);
    // this.graphView = GraphView.createFromShaderGraph(ShaderApp.graph);
    console.log(this.graph);
  }

  layout(tssaoShader: Shading) {
    const map = {};
    this.nodes.forEach(node => {
      map[node.node.uuid] = node.layout;
    });
    layoutGraph(tssaoShader.graph.fragmentRoot, map);
  }

  updateViewport(view: ViewNode) {
    console.log("upd");
  }

  isShaderFunctionNode(node) {
    return node instanceof ShaderFunctionNode;
  }

  codeGen() {
    this.showCode = true;
    // const result = ShaderApp.graph.compile();
    // this.codeGenResult = injectFragmentShaderHeaders(result, result.fragmentShaderString);
  }

  updateLine(node: DAGNode){
    console.log('l')
    this.notifyNodeNeedUpdateLine(node)
    node.toNodes.forEach(no =>{
      this.notifyNodeNeedUpdateLine(no);
    })
  }

  notifyNodeNeedUpdateLine(n: DAGNode){
    if(this.$refs.vueNodes){
      for (let i = 0; i < (this.$refs.vueNodes as Array<DAGNodeView>).length; i++) {
        const v = this.$refs.vueNodes[i];
        if(v.node === n){
          v.updateLine();
        }
      }
    }
  }

  addUniform() {
    this.nodes.push({
      node: uniform("unnamed", GLDataType.float),
      layout: {
        absX: 0,
        absY: 0,
        width: 100,
        height: 100
      }
    });
  }

  updateTechnique() {
    ShaderApp.updateShader();
  }

  start() {
    ShaderApp.start();
  }

  end() {
    ShaderApp.canvasRun = false;
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
