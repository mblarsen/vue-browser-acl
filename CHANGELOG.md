# CHANGELOG

0.13.2

- fix: reset disable and readonly in case state changes (issue #24)

0.13.1

- internals on how the setupCallback is detected
- changes to build setup

0.13.0

- bugfix: when the value was an array it would be treated as the array syntax.
  With this version the array syntax is only used in case the expression
  actually uses the '[ ]' syntax. In contrast 'posts' would be treated as a
  value. *This fix is backward incompatible* and if you have stored you
  expressions as variables you'll have to actually stick them in the template.
  Which I would recommend anyway, howelse can you see what is going on.

0.12.3

- chore: replace poi with rollup (closes #21)
- feat: add tests with jest (closes #14)

0.12.2

- bug: fixed bug introduced in 0.12.0 that caused non-function route statments to fail

0.12.0

- new: parent routes are now respected and their tests are run before the
  child/leaf routes. Supports both sync/async tests.

- breaking: changed method signature of meta.can router function. The third parameter is now the `can` function.
  When a function for `meta.can` you must return a promise that returns `true`
  if the user *can*.

0.11.0

- new: add support for
  [`readonly`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#readonly).
  It is used the same way as `disable`.
