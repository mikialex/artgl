import Vue from 'vue'
import Vuex from 'vuex'

import { examples } from "../../example/contents/exports";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    showConfigPanel: true,
    showScenePanel: true,
    examples,
    viewExample: "",
  },
  mutations: {

  },
  actions: {

  }
})
