# CHANGELOG

## next

## 0.15.4

- fix: change 'disabled' and 'readonly' if not set (#63)

## 0.15.3

- types: changed base type from VueConstructor to Vue (#71)

## 0.15.2

- internal changes: gets rid of explicit references to HTMLElements children

## 0.15.1

- internal changes

## 0.15.0

- breaking: renamed 'Subject' → 'VerbObject' see [mblarsen/browser-acl's
  CHANGELOG](mblarsen/browser-acl) for details.

## 0.14.2

- fix: fixed regression introduced in 0.14.1

## 0.14.1

- feat: "align" package export with type definitions to get better intelisense.

## 0.14.0

- change: a rewrite in TypeScript
- breaking: 'disable' and 'readonly' will now only work on the HTMLElements
  that support those attributes. Effectively this will not change anything
  with regards to the DOM elements, however, if you've written CSS around it
  may no longer work.
  E.g. `<div disabled="disabled">`, CSS: `div[disabled] { color: grey }` if
  this is a common pattern and you need it please add an issue about it.
  Note: 'hide' (default) will work for all elements.
- fix: no longer clears vnode.data, only its directives

## 0.13.7

- chore: improve TypeScript support over previous release (thanks to @JasonLandbridge)

## 0.13.6

- chore: add TypeScript definitions (thanks to @JasonLandbridge)
- chore: update dependencies (browser-acl 7.3 -> 7.5 amongst other things)

## 0.13.5

- feat: fail and failRoute can be a function which allows you to do things like
  redirect after login.
- chore: format with prettier

## 0.13.4

- feat: `options.aliases` is an array of aliases for 'can'. This replaces the
  new feature of 13.3 and adds a directive for each alias as well.

## 0.13.3

- feat: add 'role' as synonym for 'can' in route.meta

## 0.13.2

- fix: reset disable and readonly in case state changes (issue #24)

## 0.13.1

- internals on how the setupCallback is detected
- changes to build setup

## 0.13.0

- bugfix: when the value was an array it would be treated as the array syntax.
  With this version the array syntax is only used in case the expression
  actually uses the '[ ]' syntax. In contrast 'posts' would be treated as a
  value. _This fix is backward incompatible_ and if you have stored you
  expressions as variables you'll have to actually stick them in the template.
  Which I would recommend anyway, howelse can you see what is going on.

## 0.12.3

- chore: replace poi with rollup (closes #21)
- feat: add tests with jest (closes #14)

## 0.12.2

- bug: fixed bug introduced in 0.12.0 that caused non-function route statments to fail

## 0.12.0

- new: parent routes are now respected and their tests are run before the
  child/leaf routes. Supports both sync/async tests.

- breaking: changed method signature of meta.can router function. The third parameter is now the `can` function.
  When a function for `meta.can` you must return a promise that returns `true`
  if the user _can_.

## 0.11.0

- new: add support for
  [`readonly`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#readonly).
  It is used the same way as `disable`.
