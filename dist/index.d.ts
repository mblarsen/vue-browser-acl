import { VueConstructor } from 'vue'
import Acl from 'browser-acl'
import { Verb, Subject } from 'browser-acl/types'
import VueRouter from 'vue-router/types'
import { Options as AclOptions } from 'browser-acl/types'

export interface AclWithRouter extends Acl {
  router?: (router: VueRouter) => void
}

export type Helper = (verb: Verb, subject: Subject, ...args: any[]) => boolean

export type HelperMany = (
  verb: Verb,
  subject: Subject[],
  ...args: any[]
) => boolean

export type Options = {
  acl?: AclOptions
  aliases?: string[]
  assumeGlobal?: boolean
  caseMode?: boolean
  debug?: boolean
  directive?: string
  failRoute?: string
  helper?: boolean
  strict?: boolean
  router?: VueRouter
}

export type CompiledOptions = {
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

export declare class VueBrowserAcl {
  install: (
    Vue: VueConstructor,
    user: User | UserGetter,
    aclOrSetupCallback?: Acl | SetupCallback | undefined,
    options?: Options,
  ) => void
}

declare module 'vue/types/vue' {
  interface VueConstructor {
    $can: Helper
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $can: Helper
  }
  interface Context {
    $can: Helper
  }
}

declare const vueBrowserAclGlobalInstance: VueBrowserAcl

export default vueBrowserAclGlobalInstance
