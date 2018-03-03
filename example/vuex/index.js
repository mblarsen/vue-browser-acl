import Vue from 'vue/dist/vue.js'

import acl from './acl'
import store from './store'
import Acl from '../../index.js'
import App from './App'

Vue.use(Acl, store.user, acl)

new Vue({
  store,
  template: '<App/>',
  components: {App}
}).$mount('#app')

