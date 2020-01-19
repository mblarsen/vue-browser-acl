import Vue from 'vue'
import Router from 'vue-router'
import Posts from '../api/Posts.js'
import debug from 'debug'

const log = debug('demo:router')

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: () => import('@pages/Home'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@pages/Admin'),
      meta: {
        role: 'admin',
        fail: function(to, from) {
          log('intended route stored in localStorage')
          window.localStorage.setItem('intendedRoute', to.name)
          return '/'
        },
      },
    },
    {
      path: '/post/:id',
      props: true,
      name: 'post',
      component: () => import('@pages/Post'),
      meta: {
        can: (to, from, can) => {
          log(`fetching post ${to.params.id}`)
          // It is important here that you return a promise
          return Posts.find(to.params.id).then(post => {
            log(`post fetched`)
            // Whatever you return in the promise only values
            // that is strictly true will let you continue
            const verdict = can('edit', post)
            log(`verdict ${verdict}`)
            return verdict
          })
        },
        // Where to navigate to in case 'can' fails
        fail: '/',
      },
    },
  ],
})
