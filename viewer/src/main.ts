import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlay, faStop, faStepForward,
  faSitemap, faCog, faMinusSquare,faCaretSquareDown
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faPlay)
library.add(faStop)
library.add(faStepForward)
library.add(faSitemap)
library.add(faCog)
library.add(faMinusSquare)
library.add(faCaretSquareDown)
Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
