<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas"></canvas>
    <div v-if="!isRuning" class="stop-notation"> STOPPED </div>
    <GraphViewer v-if="graphView" :graphview="graphView"/>
    <div class="command-bar">
      <button @click="run" v-if="!isRuning">run</button>
      <button @click="stop" v-if="isRuning">stop</button>
      <button @click="step" v-if="!isRuning">step next frame</button>
      <button @click="screenshot" v-if="!isRuning" disabled>download screenshot</button>
      <button @click="inspectGraph" v-if="!graphView">inspectGraph</button>
      <button @click="closeGraphInspector" v-if="graphView">closeGraphViewer</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {GLApp} from '../application';
import { GraphView } from '../model/graph-view';
import GraphViewer from '../components/graph-viewer/graph-viewer.vue';

@Component({
  components:{
    GraphViewer
  }
})
export default class ViewerCanvas extends Vue {
  isRuning:boolean = GLApp.active;
  graphView: GraphView = null;

  inspectGraph(){
    this.graphView = GraphView.create(GLApp.graph);
    GLApp.graph.enableDebuggingView = true;
  }

  closeGraphInspector(){
    this.graphView = null;
    GLApp.graph.enableDebuggingView = false;
  }

  run(){
    GLApp.run();
    this.isRuning = true;
  }

  stop(){
    GLApp.stop();
    this.isRuning = false;
  }

  step(){
    GLApp.step();
  }

  screenshot(){
    GLApp.engine.downloadCurrentRender();
  }

}
</script>


<style lang="scss" scoped>
.canvas-wrap{
  width: calc(100vw - 600px);
  border: 1px solid #ddd;
  position: relative;
}

#viewer-canvas{
  width: 100%;
  height: calc(100% - 40px); 
}

.command-bar{
  border-top:1px solid #eee;
  height: 40px;
}

.stop-notation{
  position: absolute;
  width:100%;
  height: calc(100% - 40px);
  top:0px;
  font-size: 20px;
  border: 3px solid rgb(237, 185, 185);
  color:  rgb(235, 90, 90);
  box-sizing: border-box;
}

</style>
