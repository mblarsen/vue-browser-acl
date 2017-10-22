import Vue from 'vue'
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
 * @param {Function} userAccessor
 * @param {Function|Object} setupCallback A configured Acl instance of a callback
 * @param {Object} options={}
 * @param {Boolean} [options.directive='can'] Name of the directive, and helper function
 * @param {Boolean} [options.helper=true] Adds helper function
 * @param {Boolean} [options.assumeCase=true] When true lower case subjects will be
 *                                            looked up on the vue context
 * @param {Object} aclOptions={} Options passed to the Acl constructor
 */
export default function (userAccessor, setupCallback, options = {}, aclOptions = {}) {
  /* ensure userAccessor is function */
  userAccessor = typeof userAccessor === 'function' ? userAccessor : () => userAccessor

  /* default assumeCase */
  const assumeCase = Boolean(typeof options.assumeCase === 'undefined' || options.assumeCase)

  /* setup acl */
  let acl = setupCallback
  if (!(setupCallback instanceof Acl)) {
    acl = new Acl(aclOptions)
    setupCallback(acl)
  }

  /* create directive */
  Vue.directive(options.directive || 'can', function (el, binding, vnode) {
    const behaviour = binding.modifiers.disable ? 'disable' : 'hide'

    let verb, subject, params
    if (Array.isArray(binding.value)) {
      [verb, subject, ...params] = binding.value
    } else if (typeof binding.value === 'string') {
      [verb, subject] = binding.value.split(' ')
      if (typeof subject === 'string' && assumeCase && subject[0].match(/[a-z]/)) {
        subject = vnode.context[subject]
      }
      params = []
    }

    if (!verb || !subject) {
      throw new Error('Missing verb or subject')
    }

    const aclMethod = binding.modifiers.some && 'some' || binding.modifiers.every && 'every' || 'can'
    const ok = acl[aclMethod](userAccessor(), verb, subject, ...params)

    if (!ok) {
      if (behaviour === 'hide') {
        commentNode(el, vnode)
      } else if (behaviour === 'disable') {
        el.disabled = true
      }
    }
  })

  if (options.helper) {
    const helper = `$${options.directive || 'can'}`
    Vue.use({
      install(Vue) {
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
    })
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
