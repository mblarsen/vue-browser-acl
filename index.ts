import  _Vue from 'vue'
import { VNode, DirectiveFunction }  from 'vue/types'
import { DirectiveBinding } from 'vue/types/options'
import VueRouter, { Route, RouteConfig }  from 'vue-router/types'
import Acl, { GlobalRule } from 'browser-acl'

interface AclOptions {
  [key: string]: any;
}

interface VueRouterMeta {
  fail?: string,
  meta?: object,
  [key: string]: any;
}

type PromiseChain = Promise<any> & {
  getFail: () => string | Function | null
}

type Options = {
  acl?: AclOptions,
  aliases?: string[],
  assumeGlobal?: boolean,
  caseMode?: boolean,
  debug?: boolean,
  directive?: string,
  failRoute?: string,
  helper?: boolean,
  strict?: boolean,
  router?: VueRouter
}

type CompiledOptions = {
  acl: AclOptions,
  aliases: string[],
  assumeGlobal: boolean,
  caseMode: boolean,
  debug: boolean,
  directive: string,
  failRoute: string,
  helper: boolean,
  strict: boolean,
  router?: VueRouter
}

type User = object

type UserGetter = () => User

type SetupCallback = (acl: Acl) => void

/**
 * VueAcl constructor function
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
 *
 * @access public
 * @param {Function|Object} user A user instance or a function that returns the user
 * @param {Function|Object} setupCallback A configured Acl instance or a callback callback that adds rules and policies.
 * @param {Object}   options={}
 * @param {Object}  [options.acl={}] Options passed to the Acl constructor
 * @param {Boolean} [options.assumeGlobal=true] If no subject is specified in route assume it is a global rule
 * @param {Boolean} [options.caseMode=true] When true lower case subjects will be looked up on the vue context
 * @param {Boolean} [options.debug=false] Outputs errors and other useful information to the console
 * @param {Boolean} [options.directive='can'] Name of the directive, and helper function
 * @param {String}  [options.failRoute='/'] Set a default fail route
 * @param {Boolean} [options.helper=true] Adds helper function
 * @param {Boolean} [options.strict=false] Causes redirect to fail route if route permissions are absent
 * @param {?Object}  options.router Vue router
 */
export default {
  install: function(Vue: _Vue, user: User|UserGetter, aclOrSetupCallback: Acl|SetupCallback|undefined|null = null, options: Options = {}) {
    const userAccessor: Function = typeof user === 'function' ? user : () => user

    /* defaults */
    const strict = Boolean(options.strict)

    const opt: CompiledOptions = Object.assign(
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
    let acl: Acl
    if (typeof aclOrSetupCallback === 'function') {
      acl = new Acl(opt.acl)
      aclOrSetupCallback(acl)
    } else {
      acl = aclOrSetupCallback
    }

    /* router init function */
    acl.router = function(router: VueRouter) {
      opt.router = router

      const canNavigate = (verb: string, subject: string|null, ...otherArgs: any[]) => {
        return (
          (subject && acl.can(userAccessor(), verb, subject, ...otherArgs)) ||
          (!subject && !opt.strict)
        )
      }

      /* convert 'edit Post' to ['edit', 'Post'] */
      const aclTuple = (value: string): [string, string|null] => {
        const [
          verb,
          subject = opt.assumeGlobal ? GlobalRule : null
        ] = value.split(' ')
        return [verb, subject]
      }

      /**
       * chain all can-statements and functions as promises
       * each can-function must return a promise (in strict
       * mode at least). To break the chain return a none
       * true value
       */
      const chainCans = (metas: VueRouterMeta[], to: Route, from: Route): PromiseChain => {
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
              .catch(error => {
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

      router.beforeEach((to: Route, from: Route, next) => {
        const metas = to.matched
          .filter(route => route.meta && findCan(route.meta))
          .map(route => route.meta)

        const chain = chainCans(metas, to, from)

        chain.then(result => {
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
    const directiveHandler: DirectiveFunction = function(el: HTMLElement, binding: DirectiveBinding,  vnode: VNode, oldVnode: VNode): void {
      const behaviour = binding.modifiers.disable ? 'disable' : 'hide'

      let verb, verbArg, subject, params
      verbArg = binding.arg

      if (Array.isArray(binding.value) && binding.expression.startsWith('[')) {
        ;[verb, subject, params] = binding.modifiers.global
          ? arrayToGlobalExprTpl(binding)
          : arrayToExprTpl(binding)
      } else if (typeof binding.value === 'string') {
        ;[verb, subject, params] = stringToExprTpl(binding, vnode, opt)
      } else if (verbArg && typeof binding.value === 'object') {
        verb = verbArg
        subject = binding.value
        params = []
      } else if (
        binding.value === undefined &&
        !binding.modifiers.global &&
        opt.assumeGlobal
      ) {
        // Fall back to global if no value is provided
        verb = verbArg
        subject = GlobalRule
        params = []
      }

      if (opt.assumeGlobal && !subject) {
        subject = GlobalRule
        params = params || []
        verb = verb || verbArg
      }

      if (!verb || !subject) {
        throw new Error('Missing verb or subject')
      }

      const aclMethod =
        (binding.modifiers.some && 'some') ||
        (binding.modifiers.every && 'every') ||
        'can'

      const ok = acl[aclMethod](userAccessor(), verb, subject, ...params)
      const not = binding.modifiers.not

      el.disabled = false
      el.readOnly = false
      if ((ok && not) || (!ok && !not)) {
        if (behaviour === 'hide') {
          commentNode(el, vnode)
        } else if (behaviour === 'disable') {
          el.disabled = true
        } else if (behaviour === 'readonly') {
          el.readOnly = true
        }
      }
    }

    /* set up directive for 'can' and aliases */
    const directiveNames = [opt.directive, ...opt.aliases]
    directiveNames.forEach(name => Vue.directive(name, directiveHandler))

    /* define helpers */
    if (opt.helper) {
      const helper = `$${opt.directive}`
      Vue.prototype[helper] = function() {
        return acl.can(userAccessor(), ...arguments)
      }
      Vue.prototype[helper].not = function() {
        return !acl.can(userAccessor(), ...arguments)
      }
      Vue.prototype[helper].every = function() {
        return acl.every(userAccessor(), ...arguments)
      }
      Vue.prototype[helper].some = function() {
        return acl.some(userAccessor(), ...arguments)
      }
    }
  },
}

/**
 * Create comment node
 *
 * @private
 * @author https://stackoverflow.com/questions/43003976/a-custom-directive-similar-to-v-if-in-vuejs#43543814
 */
function commentNode(el, vnode) {
  const comment = document.createComment(' ')

  Object.defineProperty(comment, 'setAttribute', {
    value: () => undefined,
  })

  vnode.text = ' '
  vnode.elm = comment
  vnode.isComment = true
  vnode.tag = undefined
  vnode.data.directives = undefined

  if (vnode.componentInstance) {
    vnode.componentInstance.$el = comment
  }

  if (el.parentNode) {
    el.parentNode.replaceChild(comment, el)
  }
}

/**
 * Return the first property from meta that is 'can' or one of its aliases.
 */
const findCanWithOptions = (opt: CompiledOptions) => (meta: VueRouterMeta): string|Function => {
  return ([opt.directive, ...opt.aliases || []] as string[])
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
  GlobalRule,
  arg ? value : value.slice(1),
]

/**
 * Maps binding.value of type string to expression tuple
 */
const stringToExprTpl = ({ arg, value, modifiers }: DirectiveBinding, vnode: VNode, opt: CompiledOptions) => {
  let [verb, subject] = arg ? [arg, value] : value.split(' ')

  if (subject && modifiers.global) {
    throw new Error(
      'You cannot provide subject and use global modifier at the same time',
    )
  }

  if (
    typeof subject === 'string' &&
    opt.caseMode &&
    subject[0].match(/[a-z]/) &&
    typeof vnode.context === 'object'
  ) {
    subject = vnode.context.$data[subject]
  }

  return [verb, subject, []]
}
