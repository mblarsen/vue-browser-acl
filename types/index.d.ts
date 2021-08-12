import Acl from 'browser-acl'
import { Verb, VerbObject, Options as AclOptions } from 'browser-acl'
import Vue, { VueConstructor } from 'vue/types'
import VueRouter from 'vue-router/types'

export { Verb, VerbObject, TestFunction } from 'browser-acl'

export interface AclWithRouter extends Acl {
  router?: (router: VueRouter) => void
}

export type Behaviour = 'disable' | 'readonly' | 'hide'

export type Options = {
  acl: AclOptions
  aliases: string[]
  assumeGlobal: boolean
  caseMode: boolean
  debug: boolean
  directive: string
  failRoute: string
  helper: boolean
  strict: boolean
  router?: VueRouter
}

export type AclHelper = (
  verb: Verb,
  verbObject: VerbObject,
  ...args: any[]
) => boolean

export type AclHelperMany = (
  verb: Verb,
  verbObject: VerbObject[],
  ...args: any[]
) => boolean

export interface VueRouterMeta {
  fail?: string
  meta?: object
  [key: string]: any
}

export type PromiseChain = Promise<any> & {
  getFail: () => string | Function | null
}

export type User = {
  [key: string]: any
}

export type UserGetter = () => User

export type SetupCallback = (acl: Acl) => void

/**
 * VueAcl
 *
 * ```javascript
 * import Vue from 'vue'
 * import Acl from 'vue-browser-acl'
 *
 * Vue.use(Acl, user, (acl) => {
 *   acl.rule(view, Post)
 *   acl.rule([edit, delete], Post, (user, post) => post.userId === user.id)
 *   acl.rule('moderate', Post, (user) => user.isModerator())
 * })
 * ```
 */
export type VueAcl = {
  install: (
    Vue: VueConstructor,
    user: User | UserGetter,
    aclOrSetupCallback?: Acl | SetupCallback | undefined,
    options?: Partial<Options>,
  ) => void
}

declare module 'vue/types/vue' {
  interface Vue {
    $can: AclHelper
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $can: AclHelper
  }
  interface Context {
    $can: AclHelper
  }
}

