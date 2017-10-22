# vue-browser-acl

[![build status](http://img.shields.io/travis/mblarsen/browser-acl.svg)](http://travis-ci.org/mblarsen/vue-browser-acl)
[![Known Vulnerabilities](https://snyk.io/test/github/mblarsen/vue-browser-acl/badge.svg)](https://snyk.io/test/github/mblarsen/vue-browser-acl)
[![NPM version](http://img.shields.io/npm/v/vue-browser-acl.svg)](https://www.npmjs.com/package/vue-browser-acl/) [![](https://img.shields.io/npm/dm/vue-browser-acl.svg)](https://www.npmjs.com/package/vue-browser-acl/)

> Easy ACL in Vue build on top of the [browser-acl](https://github.com/mblarsen/browser-acl) package.

## Install

```
yarn add vue-browser-acl
```

## Setup

```javascript
import VueAcl from 'vue-browser-acl'

VueAcl(() => user, (acl) => {
  acl.rule(view, Post)
  acl.rule([edit, delete], Post, (user, post) => post.userId === user.id)
  acl.rule('moderate', Post, (user) => user.isModerator())
})
```

Make sure to see [browser-acl](https://github.com/mblarsen/browser-acl) for how to define rules and policies.

## Usage

You can use the module as directive and as a helper function.

### Directive

The simplest way to use the direct is with the string syntax.

```vue
<button v-can="'create Post'">Delete</button>
```

The string `create Post` is interpreted as the verb 'create' on the subject with name 'Post' (a class name).

```vue
<button v-can="'delete post'">Delete</button>
```

The string `create post` is interpreted as the verb 'create' on the subject that is a property on the component
in which the directive is used.

```vue
<button v-can="['delete', post]">Delete</button>
```

An alternative syntax is to pass in an array with the verb first and the subject second. This has the advantage
that `post` will be checked on build time that exists on the component.

```vue
<button v-can.disable="'delete post'">Delete</button>
```

In this example the `disable` argument is used. The button will be disabled rather than hidden.

```
<button v-can.some="'mark notifications'">Mark read</button>
<button v-can.every="'archive posts'">Archive all</button>
```

The `some` and `every` arguments takes multiple subjects. See [browser-acl](https://github.com/mblarsen/browser-acl) for more info
on how to use them.
