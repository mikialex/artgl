import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/home.vue'
import Viewer from './views/viewer.vue'
import ShaderEditor from './views/shader-editor.vue'
import Debug from './views/debug.vue'
import ExampleView from './views/example/example-page.vue'
import ExampleItemView from './views/example/example-item-page.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/debug',
      name: 'debug',
      component: Debug
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: Viewer
    },
    {
      path: '/shader',
      name: 'shader-editor',
      component: ShaderEditor
    },
    {
      path: '/examples',
      name: 'examples',
      component: ExampleView
    },
    {
      path: '/example/:name',
      name: 'example',
      component: ExampleItemView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})
