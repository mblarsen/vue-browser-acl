import Acl from 'browser-acl'

/**
 * VueAcl constructor function
 *
 * ```javascript
 * import VueAcl from 'vue-browser-acl'
 *
 * VueAcl(() => user, (acl) => {
 *   acl.rule(view, Post)
 *   acl.rule([edit, delete], Post, (user, post) => post.userId === user.id)
 *   acl.rule('moderate', Post, (user) => user.isModerator())
 * })
 * ```
 *
 * @access public
 * @param {Function|Object} user A user instance or a function that returns the user
 * @param {Function|Object} setupCallback A configured Acl instance or a callback callback that
 *                                        adds rules and policies.
 * @param {Object} options={}
 * @param {Boolean} [options.directive='can'] Name of the directive, and helper function
 * @param {Boolean} [options.helper=true] Adds helper function
 * @param {Boolean} [options.caseMode=true] When true lower case subjects will be
 *                                          looked up on the vue context
 * @param {Boolean} [options.strictRoutes=false] Will fail if route permissions are absent
 * @param {Object} [options.acl={}] Options passed to the Acl constructor
 * @param {?Object} options.router Vue router
 */
export default {
  install: function (Vue, user, setupCallback, options = {}) {

    /* ensure userAccessor is function */
    const userAccessor = typeof user === 'function' ? user : () => user

    /* defaults */
    options = Object.assign({
      acl: {},
      caseMode: true,
      helper: true,
      directive: 'can',
      strictRoutes: false,
    }, options)

    /* setup acl */
    let acl = setupCallback
    if (!(setupCallback instanceof Acl)) {
      acl = new Acl(options.acl)
      setupCallback(acl)
    }

    /* router init function */
    acl.router = function (router) {
      options.router = router
      router.beforeEach((to, from, next) => {
        const fail = to.meta.fail || '/'
        const meta = to.meta || {}

        if (typeof meta.can === 'function') {
          const next_ = (verb, subject, ...otherArgs) => {
            if ((subject && acl.can(userAccessor(), ...otherArgs)) || (!subject && !options.strictRoutes)) {
              return next()
            }
            next(fail)
          }
          return meta.can(to, from, next_)
        }

        const [verb = null, subject = null] = (to.meta.can || '').split(' ')
        if ((subject && acl.can(userAccessor(), verb, subject)) || (!subject && !options.strictRoutes)) {
          return next()
        }
        next(fail)
      })
    }

    /* init router */
    if (options.router) {
      acl.router(options.router)
    }

    /* create directive */
    Vue.directive(options.directive, function (el, binding, vnode) {
      const behaviour = binding.modifiers.disable ? 'disable' : 'hide'

      let verb, subject, params
      if (Array.isArray(binding.value)) {
        [verb, subject, ...params] = binding.value
      } else if (typeof binding.value === 'string') {
        [verb, subject] = binding.value.split(' ')
        if (typeof subject === 'string' && options.caseMode && subject[0].match(/[a-z]/)) {
          subject = vnode.context[subject]
        }
        params = []
      }

      if (!verb || !subject) {
        throw new Error('Missing verb or subject')
      }

      const aclMethod = (binding.modifiers.some && 'some') || (binding.modifiers.every && 'every') || 'can'
      const ok = acl[aclMethod](userAccessor(), verb, subject, ...params)

      if (!ok) {
        if (behaviour === 'hide') {
          commentNode(el, vnode)
        } else if (behaviour === 'disable') {
          el.disabled = true
        }
      }
    })

    /* define helpers */
    if (options.helper) {
      const helper = `$${options.directive}`
      Vue.prototype[helper] = function () {
        return acl.can(userAccessor(), ...arguments)
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
  vnode.context = undefined
  vnode.tag = undefined
  vnode.data.directives = undefined

  if (vnode.componentInstance) {
    vnode.componentInstance.$el = comment
  }

  if (el.parentNode) {
    el.parentNode.replaceChild(comment, el)
  }
}
