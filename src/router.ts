// const findCan = findCanWithOptions(opt)

/* router init function */
// acl.router = function (router: VueRouter) {
//   opt.router = router

//   const canNavigate = (
//     verb: string,
//     verbObject: string | null,
//     ...otherArgs: any[]
//   ) => {
//     return (
//       (verbObject &&
//         acl.can(userAccessor(), verb, verbObject, ...otherArgs)) ||
//       (!verbObject && !opt.strict)
//     )
//   }

//   /* convert 'edit Post' to ['edit', 'Post'] */
//   const aclTuple = (value: string): [string, string | null] => {
//     const [verb, verbObject = opt.assumeGlobal ? Acl.GlobalRule : null] =
//       value.split(' ')
//     return [verb, verbObject]
//   }

//   /**
//    * chain all can-statements and functions as promises
//    * each can-function must return a promise (in strict
//    * mode at least). To break the chain return a none
//    * true value
//    */
//   const chainCans = (
//     metas: VueRouterMeta[],
//     to: Route,
//     from: Route,
//   ): PromiseChain => {
//     let fail: string | null = null
//     const chain: PromiseChain = metas.reduce((chain, meta) => {
//       return (
//         chain
//           .then((result: any) => {
//             if (result !== true) {
//               return result
//             }

//             if (typeof meta.fail === 'string') {
//               fail = meta.fail
//             }

//             const can = findCan(meta)

//             const nextPromise =
//               typeof can === 'function'
//                 ? can(to, from, canNavigate)
//                 : Promise.resolve(canNavigate(...aclTuple(can)))

//             if (opt.strict && !(nextPromise instanceof Promise)) {
//               throw new Error(
//                 '$route.meta.can must return a promise in strict mode',
//               )
//             }

//             return nextPromise
//           })
//           // convert errors to false
//           .catch((error) => {
//             if (opt.debug) {
//               console.error(error)
//             }
//             return false
//           })
//       )
//     }, Promise.resolve(true)) as PromiseChain
//     chain.getFail = () => fail
//     return chain
//   }

//   router.beforeEach((to: Route, from: Route, next: any) => {
//     const metas = to.matched
//       .filter((route) => route.meta && findCan(route.meta))
//       .map((route) => route.meta)

//     const chain = chainCans(metas, to, from)

//     chain.then((result) => {
//       if (result === true) {
//         return next()
//       }

//       let fail: string | Function | null = chain.getFail() || opt.failRoute

//       if (fail === '$from') {
//         fail = from.path
//       }

//       next(typeof fail === 'function' ? fail(to, from) : fail)
//     })
//   })
// }

/* init router */
// if (opt.router) {
//   acl.router(opt.router)
// }

/**
 * Return the first property from meta that is 'can' or one of its aliases.
 */
// const findCanWithOptions =
//   (opt: Options) =>
//   (meta: VueRouterMeta): string | Function => {
//     return ([opt.directive, ...(opt.aliases || [])] as string[])
//       .map((key: string) => meta[key])
//       .filter(Boolean)
//       .shift()
//   }
