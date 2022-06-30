import Acl from 'browser-acl'
import { DirectiveBinding, VNode } from 'vue'
import { Behaviour, Options } from '../types'

export type SyntaxDecoder = (ctx: BindingCtx) => DecodedSyntax | undefined

type BindingCtx = {
  verbArg: any
  binding: DirectiveBinding<any>
  vnode: VNode
  opt: Options
}

export type DecodedSyntax = {
  verb: string
  verbObject: any
  params: any[]
}

/**
 * Creates a decode syntax pipeline
 */
const decodePipe = (decoders: SyntaxDecoder[]) => (ctx: BindingCtx) => {
  for (let decoder of decoders) {
    const decoded = decoder(ctx)
    if (decoded) return decoded
  }
}

/**
 * Decodes the syntax of the directive using a pipe of
 * decoders. The first decoder that returns a value
 * dertermines the syntax.
 */
export const decodeSyntax = decodePipe([
  // String syntax is used
  (ctx: BindingCtx) => {
    const { binding, vnode, opt } = ctx
    if (typeof binding.value === 'string') {
      const [verb, verbObject, params] = stringToExprTpl(binding, vnode, opt)
      return { verb, verbObject, params }
    }
  },
  // Argument syntax is used
  (ctx: BindingCtx) => {
    const { verbArg, binding } = ctx
    if (verbArg && typeof binding.value === 'object') {
      return { verb: verbArg, verbObject: binding.value, params: [] }
    }
  },
  (ctx: BindingCtx) => {
    const { binding, opt, verbArg } = ctx
    if (
      binding.value === undefined &&
      !binding.modifiers.global &&
      opt.assumeGlobal
    ) {
      // Interpret as global rule if no value is provided
      return { verb: verbArg, verbObject: Acl.GlobalRule, params: [] }
    }
  },
])

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
    // @ts-ignore
    typeof vnode.context === 'object'
  ) {
    // @ts-ignore
    verbObject = vnode.context.$data[verbObject]
  }

  return [verb, verbObject, []]
}

/**
 * Determine which modifier is used
 *
 * disable = will still show the element but will disable it
 * readonly = will still show the element but will make it readonly
 * hide = will hide the element
 */
export function getBehaviour(
  modifiers: DirectiveBinding['modifiers'],
): Behaviour {
  if (typeof modifiers.disable !== 'undefined') {
    return 'disable'
  }
  if (typeof modifiers.readonly !== 'undefined') {
    return 'readonly'
  }
  return 'hide'
}

export function getAclMethod(
  binding: DirectiveBinding,
): 'can' | 'some' | 'every' {
  return (
    (binding.modifiers.some && 'some') ||
    (binding.modifiers.every && 'every') ||
    'can'
  )
}
