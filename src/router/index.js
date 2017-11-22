import Vue from 'vue'
import Router from 'vue-router'
import Projects from '@/components/Projects/Projects'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'all-pro',
      component: Projects
    }
  ]
})
