import { VNode } from 'vue'

type VueVNode = VNode & {
  text: any
  isComment: any
  elm: Comment
  tag?: any
  data: any
  directives: any
  componentInstance?: {
    $el: Comment
  }
}

/**
 * Create comment node
 *
 * https://stackoverflow.com/questions/43003976/a-custom-directive-similar-to-v-if-in-vuejs#43543814
 *
 * @private
 */
export function makeComment(el: HTMLElement, vnode: VNode) {
  const node = vnode as VueVNode
  const comment = document.createComment(' ')

  Object.defineProperty(comment, 'setAttribute', {
    value: () => undefined,
  })

  node.text = ' '
  node.elm = comment
  node.isComment = true
  node.tag = undefined

  node.data = node.data || {}
  node.data.directives = undefined

  if (node.componentInstance) {
    node.componentInstance.$el = comment
  }

  if (el.parentNode) {
    el.parentNode.replaceChild(comment, el)
  }
}
