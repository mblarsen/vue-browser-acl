import Acl from 'browser-acl'
import { Verb, VerbObject } from 'browser-acl'
import { VueConstructor, VNode, DirectiveFunction } from 'vue/types'
import { DirectiveBinding } from 'vue/types/options'
import VueRouter, { Route } from 'vue-router/types'

import {
  AclWithRouter,
  Behaviour,
  Options,
  PromiseChain,
  SetupCallback,
  User,
  UserGetter,
  VueAcl,
  VueRouterMeta,
} from '../types'

export {
  AclWithRouter,
  Behaviour,
  Options,
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

const VueAcl: VueAcl = {
  install(
    Vue: VueConstructor,
    user: User | UserGetter,
    aclOrSetupCallback: Acl | SetupCallback | undefined = undefined,
    options: Partial<Options> = {},
  ): void {
    const userAccessor: Function =
      typeof user === 'function' ? user : () => user

    /* defaults */
    const strict = Boolean(options.strict)

    const opt: Options = Object.assign(
      {
        acl: { strict },
        aliases: ['role'],
        assumeGlobal: !strict,
        caseMode: true,
        debug: false,
        directive: 'can',
        failRoute: '/',
        helper: true,
        strict: false,
      },
      options,
    )

    const findCan = findCanWithOptions(opt)

    /* setup acl */
    let acl: AclWithRouter = new Acl(opt.acl) as AclWithRouter
    if (typeof aclOrSetupCallback === 'function') {
      aclOrSetupCallback(acl)
    } else if (aclOrSetupCallback instanceof Acl) {
      acl = aclOrSetupCallback
    }

    /* router init function */
    acl.router = function (router: VueRouter) {
      opt.router = router

      const canNavigate = (
        verb: string,
        verbObject: string | null,
        ...otherArgs: any[]
      ) => {
        return (
          (verbObject &&
            acl.can(userAccessor(), verb, verbObject, ...otherArgs)) ||
          (!verbObject && !opt.strict)
        )
      }

      /* convert 'edit Post' to ['edit', 'Post'] */
      const aclTuple = (value: string): [string, string | null] => {
        const [verb, verbObject = opt.assumeGlobal ? Acl.GlobalRule : null] =
          value.split(' ')
        return [verb, verbObject]
      }

      /**
       * chain all can-statements and functions as promises
       * each can-function must return a promise (in strict
       * mode at least). To break the chain return a none
       * true value
       */
      const chainCans = (
        metas: VueRouterMeta[],
        to: Route,
        from: Route,
      ): PromiseChain => {
        let fail: string | null = null
        const chain: PromiseChain = metas.reduce((chain, meta) => {
          return (
            chain
              .then((result: any) => {
                if (result !== true) {
                  return result
                }

                if (typeof meta.fail === 'string') {
                  fail = meta.fail
                }

                const can = findCan(meta)

                const nextPromise =
                  typeof can === 'function'
                    ? can(to, from, canNavigate)
                    : Promise.resolve(canNavigate(...aclTuple(can)))

                if (opt.strict && !(nextPromise instanceof Promise)) {
                  throw new Error(
                    '$route.meta.can must return a promise in strict mode',
                  )
                }

                return nextPromise
              })
              // convert errors to false
              .catch((error) => {
                if (opt.debug) {
                  console.error(error)
                }
                return false
              })
          )
        }, Promise.resolve(true)) as PromiseChain
        chain.getFail = () => fail
        return chain
      }

      router.beforeEach((to: Route, from: Route, next: any) => {
        const metas = to.matched
          .filter((route) => route.meta && findCan(route.meta))
          .map((route) => route.meta)

        const chain = chainCans(metas, to, from)

        chain.then((result) => {
          if (result === true) {
            return next()
          }

          let fail: string | Function | null = chain.getFail() || opt.failRoute

          if (fail === '$from') {
            fail = from.path
          }

          next(typeof fail === 'function' ? fail(to, from) : fail)
        })
      })
    }

    /* init router */
    if (opt.router) {
      acl.router(opt.router)
    }

    /* directive update handler */
    const directiveHandler: DirectiveFunction = function (
      el: HTMLElement,
      binding: DirectiveBinding,
      vnode: VNode,
    ): void {
      const behaviour: Behaviour = getBehaviour(binding.modifiers)

      let verb, verbArg, verbObject, params
      verbArg = binding.arg

      if (Array.isArray(binding.value) && binding.expression?.startsWith('[')) {
        ;[verb, verbObject, params] = binding.modifiers.global
          ? arrayToGlobalExprTpl(binding)
          : arrayToExprTpl(binding)
      } else if (typeof binding.value === 'string') {
        ;[verb, verbObject, params] = stringToExprTpl(binding, vnode, opt)
      } else if (verbArg && typeof binding.value === 'object') {
        verb = verbArg
        verbObject = binding.value
        params = []
      } else if (
        binding.value === undefined &&
        !binding.modifiers.global &&
        opt.assumeGlobal
      ) {
        // Fall back to global if no value is provided
        verb = verbArg
        verbObject = Acl.GlobalRule
        params = []
      }

      if (opt.assumeGlobal && !verbObject) {
        verbObject = Acl.GlobalRule
        params = params || []
        verb = verb || verbArg
      }

      if (!verb || !verbObject) {
        throw new Error('Missing verb or verb object')
      }

      const aclMethod =
        (binding.modifiers.some && 'some') ||
        (binding.modifiers.every && 'every') ||
        'can'

      const ok = acl[aclMethod](userAccessor(), verb, verbObject, ...params)
      const not = binding.modifiers.not

      const el_ = el as LooseHTMLElement
      el_.disabled = false
      el_.readOnly = false

      if ((ok && not) || (!ok && !not)) {
        if (behaviour === 'hide') {
          commentNode(el, vnode)
        } else if (behaviour === 'disable') {
          el_.disabled = true
        } else if (behaviour === 'readonly') {
          el_.readOnly = true
        }
      }
    }

    /* set up directive for 'can' and aliases */
    const directiveNames = [opt.directive, ...opt.aliases]
    directiveNames.forEach((name) => Vue.directive(name, directiveHandler))

    /* define helpers */
    if (opt.helper) {
      const helper = `$${opt.directive}`
      /* @type AclHelper */
      Vue.prototype[helper] = function (
        verb: Verb,
        verbObject: VerbObject,
        ...args: any[]
      ) {
        return acl.can(userAccessor(), verb, verbObject, ...args)
      }
      /* @type AclHelper */
      Vue.prototype[helper].not = function (
        verb: Verb,
        verbObject: VerbObject,
        ...args: any[]
      ) {
        return !acl.can(userAccessor(), verb, verbObject, ...args)
      }
      /* @type AclHelperMany */
      Vue.prototype[helper].every = function (
        verb: Verb,
        verbObjects: VerbObject[],
        ...args: any[]
      ) {
        return acl.every(userAccessor(), verb, verbObjects, ...args)
      }
      /* @type AclHelperMany */
      Vue.prototype[helper].some = function (
        verb: Verb,
        verbObjects: VerbObject[],
        ...args: any[]
      ) {
        return acl.some(userAccessor(), verb, verbObjects, ...args)
      }
    }
  },
}

function getBehaviour(modifiers: any): Behaviour {
  if (typeof modifiers.disable !== 'undefined') {
    return 'disable'
  }
  if (typeof modifiers.readonly !== 'undefined') {
    return 'readonly'
  }
  return 'hide'
}

/**
 * Create comment node
 *
 * @private
 * @author https://stackoverflow.com/questions/43003976/a-custom-directive-similar-to-v-if-in-vuejs#43543814
 */
function commentNode(el: HTMLElement, vnode: VNode) {
  const comment = document.createComment(' ')

  Object.defineProperty(comment, 'setAttribute', {
    value: () => undefined,
  })

  vnode.text = ' '
  vnode.elm = comment
  vnode.isComment = true
  vnode.tag = undefined

  vnode.data = vnode.data || {}
  vnode.data.directives = undefined

  if (vnode.componentInstance) {
    // @ts-ignore
    vnode.componentInstance.$el = comment
  }

  if (el.parentNode) {
    el.parentNode.replaceChild(comment, el)
  }
}

/**
 * Return the first property from meta that is 'can' or one of its aliases.
 */
const findCanWithOptions =
  (opt: Options) =>
  (meta: VueRouterMeta): string | Function => {
    return ([opt.directive, ...(opt.aliases || [])] as string[])
      .map((key: string) => meta[key])
      .filter(Boolean)
      .shift()
  }

/**
 * Maps binding.value of type array to expression tuple
 */
const arrayToExprTpl = ({ arg, value }: DirectiveBinding) => [
  arg || value[0],
  arg ? value[0] : value[1],
  arg ? value.slice(1) : value.slice(2),
]

/**
 * Maps binding.value of type array to global expression tuple
 */
const arrayToGlobalExprTpl = ({ arg, value }: DirectiveBinding) => [
  arg || value[0],
  Acl.GlobalRule,
  arg ? value : value.slice(1),
]

/**
 * Maps binding.value of type string to expression tuple
 */
const stringToExprTpl = (
  { arg, value, modifiers }: DirectiveBinding,
  vnode: VNode,
  opt: Options,
) => {
  let [verb, verbObject] = arg ? [arg, value] : value.split(' ')

  if (verbObject && modifiers.global) {
    throw new Error(
      'You cannot provide verb object and use global modifier at the same time',
    )
  }

  if (
    typeof verbObject === 'string' &&
    opt.caseMode &&
    verbObject[0].match(/[a-z]/) &&
    typeof vnode.context === 'object'
  ) {
    verbObject = vnode.context.$data[verbObject]
  }

  return [verb, verbObject, []]
}

export default VueAcl
