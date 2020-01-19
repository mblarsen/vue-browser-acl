import { allPosts, createPost, deletePost, findPost } from '../../api/Posts.js'

const state = {
  posts: [],
  error: null,
  busy: false,
}

const getters = {
  posts: state => state.posts,
  error: state => state.error,
  busy: state => state.busy,
}

const actions = {
  fetch({ commit }, page = 1) {
    commit('setBusy')
    allPosts(page)
      .then(posts => {
        commit('setPosts', posts)
      })
      .catch(error => {
        commit('setError', error.message)
      })
  },
  create({ commit }, post) {
    console.log('creating post', post)
    createPost(post)
      .then(post => {
        commit('addPost', post)
      })
      .catch(error => {
        commit('setError', error.message)
      })
  },
  delete({ commit }, post) {
    deletePost(post.id)
      .then(() => {
        commit('removePost', post)
      })
      .catch(error => {
        commit('setError', error.message)
      })
  },
}

const mutations = {
  setError(state, error) {
    state.error = error
    state.busy = false
  },
  setPosts(state, posts) {
    state.posts = posts
    state.error = null
    state.busy = false
  },
  addPost(state, post) {
    state.posts = { post, ...state.posts }
  },
  removePost(state, post) {
    state.posts = state.posts.filter(p => p.id !== post.id)
    state.busy = false
  },
  setBusy(state) {
    state.busy = true
    state.error = null
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
