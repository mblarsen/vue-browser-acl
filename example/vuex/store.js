import Vue from 'vue/dist/vue.js'
import Vuex from 'vuex'

import User from './models/User'
import Post from './models/Post'

Vue.use(Vuex)

console.log(User)
const guest = new User({name: 'Guest', role: 'guest'})

console.log(guest)
const state = {
  user: guest,
  posts: [],
  fetching: false,
  authenticating: false,
}
console.log(state)
const actions = {
  login({commit}, {creds}) {
    commit('AUTHENTICATING', {onoff: true})
    setTimeout(() => {
      commit('USER', {user: new User(creds)})
    }, 1500)
  },
  logout({commit}) {
    commit('LOGOUT')
  },
  fetchPosts({commit, state}) {
    commit('FETCHING', {onoff: true})
    setTimeout(() => {
      commit('FETCHING', {onoff: false})
      commit('POSTS', {posts: Array.from({length: 10}).map((_, i) => {
        const author = state.user
          ? Math.random() < 0.2
          : 'someoneElse47'
        return new Post({title: `Title ${i + 1}`, author})
      })})
    }, 1500)
  }
}

const mutations = {
  ['POSTS']: function (state, {posts}) {
    state.posts = posts
  },
  ['USER']: function (state, {user}) {
    state.user = user
    state.authenticating = false
  },
  ['AUTHENTICATING']: function (state, {onoff}) {
    state.authenticating = onoff
  },
  ['FETCHING']: function (state, {onoff}) {
    state.fetching = onoff
  },
  ['LOGOUT']: function (state) {
    state.user = guest
  }
}

const getters = {
  user: ({user}) => user,
  posts: ({posts}) => posts,
  isFetching: ({fetching}) => fetching
}

export default new Vuex.Store({
  actions,
  getters,
  mutations,
  strict: false
})

