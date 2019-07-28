# CHANGELOG

0.12.0

- breaking: changed method signature of meta.can router function. The third parameter is now the `can` function.
  When a function for `meta.can` you must return a promise that returns `true` if the user *can*.

