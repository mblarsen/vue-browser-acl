import Acl from 'browser-acl'
// import { Verb, VerbObject } from 'browser-acl'
import { Plugin, DirectiveBinding, FunctionDirective, VNode, App } from 'vue'
import {
  DecodedSyntax,
  decodeSyntax,
  getAclMethod,
  getBehaviour,
} from './decode'
import { makeComment } from './makeComment'
import {
  AclWithRouter,
  Behaviour,
  Options,
  SetupCallback,
  User,
  UserGetter,
  VueAcl,
} from '../types'
import { applyDefaults } from './options'

export {
  AclWithRouter,
  Behaviour,
  PromiseChain,
  SetupCallback,
  User,
  UserGetter,
  VueRouterMeta,
} from '../types'

interface LooseHTMLElement extends HTMLElement {
  disabled: boolean
  readOnly: boolean
}

const VueAcl: Plugin = {
  install(
    app: App,
    user: User | UserGetter,
    aclOrSetupCallback: Acl | SetupCallback | undefined = undefined,
    options: Partial<Options> = {},
  ): void {
    const userAccessor: Function =
      typeof user === 'function' ? user : () => user

    const opt = applyDefaults(options)
    // const strict = opt.strict

    // Configure ACL
    let acl: AclWithRouter = new Acl(opt.acl) as AclWithRouter
    if (typeof aclOrSetupCallback === 'function') {
      aclOrSetupCallback(acl)
    } else if (aclOrSetupCallback instanceof Acl) {
      acl = aclOrSetupCallback
    }

    // Define directive handler
    const handler: FunctionDirective<HTMLElement> = function (
      el,
      binding: DirectiveBinding,
      vnode,
    ): void {
      const behaviour: Behaviour = getBehaviour(binding.modifiers)

      const syntax = decodeSyntax({
        binding,
        verbArg: binding.arg,
        vnode,
        opt,
      })

      if (!syntax) {
        // TODO is !syntax the same as (!verb || !verbObject) {
        throw new Error('Missing verb or verb object')
      }

      const { ok, not } = applyAcl(acl, syntax, binding, userAccessor())

      applyBehaviour(el as LooseHTMLElement, vnode, behaviour, ok, not)
    }

    app.directive('can', handler)

    /* define helpers */
    // if (opt.helper) {
    //   const helper = `$${opt.directive}`
    //   /* @type AclHelper */
    //   Vue.prototype[helper] = function (
    //     verb: Verb,
    //     verbObject: VerbObject,
    //     ...args: any[]
    //   ) {
    //     return acl.can(userAccessor(), verb, verbObject, ...args)
    //   }
    //   /* @type AclHelper */
    //   Vue.prototype[helper].not = function (
    //     verb: Verb,
    //     verbObject: VerbObject,
    //     ...args: any[]
    //   ) {
    //     return !acl.can(userAccessor(), verb, verbObject, ...args)
    //   }
    //   /* @type AclHelperMany */
    //   Vue.prototype[helper].every = function (
    //     verb: Verb,
    //     verbObjects: VerbObject[],
    //     ...args: any[]
    //   ) {
    //     return acl.every(userAccessor(), verb, verbObjects, ...args)
    //   }
    //   /* @type AclHelperMany */
    //   Vue.prototype[helper].some = function (
    //     verb: Verb,
    //     verbObjects: VerbObject[],
    //     ...args: any[]
    //   ) {
    //     return acl.some(userAccessor(), verb, verbObjects, ...args)
    //   }
    // }
  },
}

function applyAcl(
  acl: AclWithRouter,
  syntax: DecodedSyntax,
  binding: DirectiveBinding,
  user: User,
) {
  const method = getAclMethod(binding)
  const { verb, verbObject, params } = syntax
  const ok = acl[method](user, verb, verbObject, ...params)
  const not = binding.modifiers.not
  return {
    ok,
    not,
  }
}

function applyBehaviour(
  el: LooseHTMLElement,
  vnode: VNode,
  behaviour: Behaviour,
  ok: boolean,
  not: boolean,
): void {
  if (!el.hasAttribute('disabled')) {
    el.disabled = false
  }

  if (!el.hasAttribute('readOnly')) {
    el.readOnly = false
  }

  if ((ok && not) || (!ok && !not)) {
    if (behaviour === 'hide') {
      makeComment(el, vnode)
    } else if (behaviour === 'disable') {
      el.disabled = true
    } else if (behaviour === 'readonly') {
      el.readOnly = true
    }
  }
}

export default VueAcl
