import User from '../models/User.js'
import { faultyFetch } from './utils.js'
import debug from 'debug'

const log = debug('demo:api:user')

export default class Users {
  static get() {
    const propsStr = window.sessionStorage.getItem('user')
    if (propsStr) {
      const props = JSON.parse(propsStr)
      return User.create(props)
    }
    return null
  }
  static auth(user) {
    return faultyFetch('user', user).then(user => {
      if (user) {
        window.sessionStorage.setItem('user', JSON.stringify(user))
      }
      return user
    })
  }
  static create(props) {
    const user = new User(props)
    user.id = 1
    return user
  }
  static logout() {
    window.sessionStorage.removeItem('user')
    return faultyFetch('user')
  }
  static reauthenticate() {
    const user = Users.get()
    if (user) {
      log('get user from session')
      return Promise.resolve(user)
    }
    return Promise.resolve(User.create({ type: 'guest' }))
  }
}

export const getUser = Users.get
export const createUser = Users.create
export const authUser = Users.auth
export const logout = Users.logout
export const reauthenticate = Users.reauthenticate
