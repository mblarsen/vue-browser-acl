import { authUser, logout, reauthenticate } from '../../api/Users.js'

const state = {
  user: null,
  error: null,
  authenticating: false,
  loggingOut: false,
}

const getters = {
  authenticated: state => state.user && state.user.type !== 'guest',
  user: state => state.user,
  error: state => state.error,
  authenticating: state => state.authenticating,
  loggingOut: state => state.loggingOut,
}

const actions = {
  init({ commit }) {
    commit('setAuthenticating')
    reauthenticate()
      .then(user => {
        commit('setUser', user)
      })
      .catch(error => {
        commit('setError', error.message)
      })
  },
  authenticate({ commit }, user) {
    commit('setAuthenticating')
    return authUser(user)
      .then(user => {
        commit('setUser', user)
      })
      .catch(error => {
        commit('setError', error.message)
      })
  },
  logout({ commit }) {
    commit('setLoggingOut')
    logout()
      .then(() => {
        commit('setLoggedOut')
      })
      .catch(error => {
        commit('setError', error.message)
      })
  },
}

const mutations = {
  setError(state, error) {
    state.error = error
    state.authenticating = false
    state.loggingOut = false
  },
  setUser(state, user) {
    state.user = user
    state.error = null
    state.authenticating = false
  },
  setLoggedOut(state) {
    state.user = { type: 'guest' }
    state.error = null
    state.loggingOut = false
  },
  setAuthenticating(state) {
    state.authenticating = true
    state.error = null
  },
  setLoggingOut(state) {
    state.loggingOut = true
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
