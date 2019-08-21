<template>
  <div>
    <div class="example-container">
      <h1>Examples</h1>
      <div
        v-for="example in examples"
        :key="example.name"
        class="example-entry"
      >
        <div 
        class="example-cover"
        @click="gotoExample(example.name)"
        ></div>
        <span>{{example.name}}</span>
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
  background: #fff;
  transition: 200ms;
  cursor: pointer;
  &:hover{
    transform: scale(1.1);
  }

  >span{
    margin: 3px;
  }
}

.example-container {
  width: 80vw;
  margin: auto;
}
</style>
