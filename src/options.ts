import { Options } from '../types'

export const applyDefaults = (options: Partial<Options> = {}): Options => {
  const strict = Boolean(options.strict)

  return Object.assign(
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
}
