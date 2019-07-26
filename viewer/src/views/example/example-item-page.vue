<template>
  <div>
    <h1>{{example.name}}</h1>
    <div>
      <!-- <pre>{{example.build.toString()}}</pre> -->
    </div>
    <div>
      <canvas></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components:{
  }
})
export default class ConfigPanel extends Vue {
  $store: any;
  $router: any;
  $route: any;

  get example(){
    this.$store.state.viewExample = this.$route.params.name;
    for (let i = 0; i < this.$store.state.examples.length; i++) {
      const example = this.$store.state.examples[i];
      if(example.name === this.$store.state.viewExample){
        return example;
      }
    }
    throw 'cant find example'
  }

  mounted(){
    console.log(this.example)
    this.example.build()
  }
}
</script>


<style lang="scss" scoped>

canvas{
  width: 500px;
  height: 400px;
  border: 1px solid #aaa;
}
</style>
