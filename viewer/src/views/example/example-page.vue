<template>
  <div>
    <div class="example-container">
      <h1>Examples</h1>
      <div
        v-for="example in examples"
        :key="example.name"
        class="example-entry"
        @click="gotoExample(example.name)"
      >
        <div class="example-cover"></div>
        <div>{{example.name}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class ConfigPanel extends Vue {
  $store: any;
  $router: any;

  get examples() {
    return this.$store.state.examples;
  }

  mounted() {}

  gotoExample(name) {
    console.log("goto");
    this.$store.state.viewExample = name;
    this.$router.push({
      name: "example",
      params: {
        name
      }
    });
  }
}
</script>


<style lang="scss" scoped>
.example-entry {
  display: inline-block;
  width: 300px;
  height: 250px;
  margin: 10px;
}

.example-cover {
  width: 300px;
  height: 200px;
  border: 1px solid #aaa;
  >span{

  }
}

.example-container {
  width: 80vw;
  margin: auto;
}
</style>
