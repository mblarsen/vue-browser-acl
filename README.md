# vue-browser-acl

[![build status](http://img.shields.io/travis/mblarsen/browser-acl.svg)](http://travis-ci.org/mblarsen/vue-browser-acl)
[![Known Vulnerabilities](https://snyk.io/test/github/mblarsen/vue-browser-acl/badge.svg)](https://snyk.io/test/github/mblarsen/vue-browser-acl)
[![NPM version](http://img.shields.io/npm/v/vue-browser-acl.svg)](https://www.npmjs.com/package/vue-browser-acl/) [![](https://img.shields.io/npm/dm/vue-browser-acl.svg)](https://www.npmjs.com/package/vue-browser-acl/)

> Easy ACL in Vue build on top of the [browser-acl](https://github.com/mblarsen/browser-acl) package.

* Easily manage permissions with [browser-acl](https://github.com/mblarsen/browser-acl) using rules and/or policies
* Adds `v-can` directive with simple natural language syntax: `v-can="'create Post'"` (the class) and `v-can="'edit post'"` an instance on the component
* Adds `$can` helper function to the Vue prototype (optional)
* Can be used to **hide** `v-can` or to **disable** `v-can.disable`
* Can be used on collections `v-can.some` or `v-can.every`
* Can be used with vue-router to guard routes

## Install

```
yarn add vue-browser-acl
```

## Setup

```javascript
import Vue from 'vue'
import Acl from 'vue-browser-acl'

Vue.use(Acl, user, (acl) => {
  acl.rule(view, Post)
  acl.rule([edit, delete], Post, (user, post) => post.userId === user.id)
  acl.rule('moderate', Post, (user) => user.isModerator())
})
```

You can pass in an actual user or a function that returns the users.

The second param is a callback that let's you define the rules. Alternatively you can pass
a [preconfigured acl](https://github.com/mblarsen/browser-acl#setup) from
the `browser-acl` package.

See [browser-acl setup](https://github.com/mblarsen/browser-acl) for how to define rules and policies.

As an optional third parameter you can pass an [options](#options) object.

## Usage

You can use the module as directive, with vue-router, and as a helper function.

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

```vue
<button v-can.some="'mark notifications'">Mark read</button>
<button v-can.every="'archive posts'">Archive all</button>
```

The `some` and `every` arguments takes multiple subjects. See [browser-acl](https://github.com/mblarsen/browser-acl) for more info
on how to use them.

### Helper

You can also use the helper function `$can` that works much in the same way:

```vue
<settings-table :editable="$can('update', 'Setting')" :settings="settings" />
```

or

```javascript
if (this.$can('edit', post)) {
    axios.put(`/api/posts/${post.id}`, post)
}
```

If you don't want to install the helper function pass `helper: false` in the options.

### vue-router

There are two ways to hook up the vue-router. Either during setup of the Acl or later calling the router
init funtion.

##### Option 1: setup

```javascript
Vue.use(Acl, user, (acl) => {
    ..
}, {router});
```

##### Option 2: init function

```javascript
acl.router(router)
```

#### Route permissions

You configure routes by adding `can` meta property to the route. E.g. if a router
requires create permissions for "Post":

```javascript
{
  name: 'new-post',
  path: 'posts/create',
  component: PostEditor,
  meta: {
    can: 'create Post',
    fail: '/posts'
  }
}
```

Limitation: Unlike with the directive and the helper you will not have access to class instances. E.g you
cannot use a `can: 'delete post'` as this assumes you have a Post instance already.

Optionally you have the option to specify a callback:

```javascript
{
  path: 'posts/: postId',
  component: PostEditor,
  meta: {
    can: function (to, from, next) {
      axios.get(/* fetch post async */)
        .then({post} => next('delete', post))
    }
    fail: '/posts'
  }
}
```

Normally it would be better to prevent this route from being visited in the first place. Also the
backend could perform a redirect. That said you have the option.

Note that `next` is a wrapper of the function that vue-router provides by the same name. It takes the
same arguments as the `can` function.

## Options

### router
`default: undefined`

Pass in a router instance if you want to make use of the ACL functionality in routers.

### caseMode
`default: true`

Assume case means that an upper case subject is the name of a class or a constructor function and that a lower case subject
is the component member name of an instance of that class.

E.g. if subject is `post` the directive will try to look up the data member `post` on the component.

If `caseMode` is set to false this behaviour is disabled and `post` will be treated as a subject name.

### directive
`default: can`

The name of the directive. E.g. `can` produces a directive called `v-can` and a helper function called `$can`.

You'll most likely only use this if you want to replace this module with an existing one that uses a different name.

### helper
`default: true`

Adds `$can` helper function to the Vue prototype when true.
