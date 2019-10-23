import Acl, { GlobalRule } from 'browser-acl'

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
  install: function (Vue, user, setupCallback, options = {}) {
    /* ensure userAccessor is function */
    const userAccessor = typeof user === 'function' ? user : () => user

    /* defaults */
    const strict = Boolean(options.strict)
    options = Object.assign(
      {
        acl: { strict },
        assumeGlobal: !strict,
        caseMode: true,
        debug: false,
        directive: 'can',
        failRoute: '/',
        helper: true,
        strict: false,
      },
      options
    )

    /* setup acl */
    let acl = setupCallback
    if (typeof setupCallback === 'function') {
      acl = new Acl(options.acl)
      setupCallback(acl)
    }

    /* router init function */
    acl.router = function (router) {
      options.router = router

      const canNavigate = (verb, subject, ...otherArgs) => {
        return (subject && acl.can(userAccessor(), verb, subject, ...otherArgs)) ||
          (!subject && !options.strict)
      }

      /* convert 'edit Post' to ['edit', 'Post'] */
      const metaToStatementPair = meta => {
        const [
          verb = null,
          subject = options.assumeGlobal ? GlobalRule : null
        ] = (meta.can || '').split(' ')
        return [verb, subject]
      }

      /**
       * chain all can-statements and functions as promises
       * each can-function must return a promise (in strict
       * mode at least). To break the chain return a none
       * true value
       */
      const chainCans = (metas, to, from) => {
        let fail = null
        const chain = metas.reduce((chain, meta) => {
          return chain
            .then(result => {
              if (result !== true) {
                return result
              }

              fail = meta.fail

              const nextPromise = typeof meta.can === 'function'
                ? meta.can(to, from, canNavigate)
                : Promise.resolve(canNavigate(...metaToStatementPair(meta)))

              if (options.strict && !(nextPromise instanceof Promise)) {
                throw new Error('$route.meta.can must return a promise in strict mode')
              }

              return nextPromise
            })
            // convert errors to false
            .catch(error => {
              if (options.debug) {
                console.error(error)
              }
              return false
            })
        }, Promise.resolve(true))
        chain.getFail = () => fail
        return chain
      }

      router.beforeEach((to, from, next) => {
        const metas = to.matched
          .filter(route => route.meta && route.meta.can)
          .map(route => route.meta)

        const chain = chainCans(metas, to, from)
        chain.then(result => {
          if (result === true) {
            return next()
          }
          const fail = chain.getFail() === '$from'
            ? from.path
            : chain.getFail()
          next(fail || options.failRoute)
        })
      })
    }

    /* init router */
    if (options.router) {
      acl.router(options.router)
    }

    /* create directive */
    Vue.directive(options.directive, function(el, binding, vnode) {
      const behaviour = binding.modifiers.disable ? 'disable' : 'hide'

      let verb, verbArg, subject, params
      verbArg = binding.arg
      if (Array.isArray(binding.value) && binding.expression.startsWith('[')) {
        [verb, subject, params] = binding.modifiers.global
          ? arrayToGlobalExprTpl(binding)
          : arrayToExprTpl(binding)
      } else if (typeof binding.value === 'string') {
        [verb, subject, params] = stringToExprTpl(binding, vnode, options)
      } else if (verbArg && typeof binding.value === 'object') {
        verb = verbArg
        subject = binding.value
        params = []
      } else if (binding.value === undefined && !binding.modifiers.global && options.assumeGlobal) {
        // Fall back to global if no value is provided
        verb = verbArg
        subject = GlobalRule
        params = []
      }

      if (options.assumeGlobal && !subject) {
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
    })

    /* define helpers */
    if (options.helper) {
      const helper = `$${options.directive}`
      Vue.prototype[helper] = function () {
        return acl.can(userAccessor(), ...arguments)
      }
      Vue.prototype[helper].not = function () {
        return !acl.can(userAccessor(), ...arguments)
      }
      Vue.prototype[helper].every = function () {
        return acl.every(userAccessor(), ...arguments)
      }
      Vue.prototype[helper].some = function () {
        return acl.some(userAccessor(), ...arguments)
      }
    }
  }
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
    value: () => undefined
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
 * Maps binding.value of type array to expression tuple
 */
const arrayToExprTpl = ({arg, value}) => ([
  arg || value[0],
  arg ? value[0] : value[1],
  arg ? value.slice(1) : value.slice(2)
])

/**
 * Maps binding.value of type array to global expression tuple
 */
const arrayToGlobalExprTpl = ({arg, value}) => ([
  arg || value[0],
  GlobalRule,
  arg ? value : value.slice(1)
])

/**
 * Maps binding.value of type string to expression tuple
 */
const stringToExprTpl = ({arg, value, modifiers}, vnode, options) => {
  let [verb, subject] = arg ? [arg, value] : value.split(' ')

  if (subject && modifiers.global) {
    throw new Error('You cannot provide subject and use global modifier at the same time')
  }

  if (
    typeof subject === 'string' &&
    options.caseMode &&
    subject[0].match(/[a-z]/)
  ) {
    subject = vnode.context[subject]
  }

  return [verb, subject, []]
}
