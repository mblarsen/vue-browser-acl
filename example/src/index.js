import Vue from 'vue'
import App from '@components/App'
import router from './router'
import Acl from 'vue-browser-acl'
import store from './store/index.js'
import Post from './models/Post.js'
import debug from 'debug'
import makeServer from './api/server.js'

makeServer()

const log = debug('demo')

// Sync the user is asynchronously fetch we
// provide a function to fetch it in this case
// we access it through the Vuex store.
const user = () => {
  return store.getters['user/user']
}

// Kick of the application's auth system
store.dispatch('user/init')

class PostPolicy {
  beforeAll(_, user) {
    if (user && user.type === 'admin') {
      log(`user is admin`)
      return true
    } else if (user.type === 'guest') {
      log(`user isn't logged in`)
      return false
    }
    log('let rules rule')
    // returning void is different from false
    // false is a hard no
    // void lets the other rules decide
  }
  create(user) {
    log('create rule')
    return user
  }
  edit(user, post) {
    log('edit rule')
    // Since the beforeAll hook already checked for admin and empty user we
    // don't have to do it here
    return user.name === post.user
  }
  delete(user, post) {
    log('delete rule')
    return user.name === post.user
  }
}

// Setup user rules. The `acl` is an acl instance (of browser-acl)
// that the plugin provides you for registering rules and policies
Vue.use(
  Acl,
  user,
  acl => {
    // Only admin users can do admin-stuff
    acl.rule('admin', user => user && user.type === 'admin')
    acl.rule(
      'super',
      user => user && user.type === 'admin' && user.name === 'super',
    )
    acl.policy(PostPolicy, Post)
    // these rules are the equivalent of the PostPolicy, it should
    // be obvious how policies simplifies the logic:
    // acl.rule('create', Post, (user) => user && user.type !== 'guest')
    // acl.rule('edit', Post, (user, post) => user && (user.type === 'admin' || user.name === post.user))
    // acl.rule('delete', Post, (user, post) => user && (user.type === 'admin' || user.name === post.user))
  },
  { router },
)

Vue.config.productionTip = false
const render = h => h(App)

new Vue({ router, render, store }).$mount('#app', true)
