# vue-browser-acl 🔒

[![build status](http://img.shields.io/travis/mblarsen/browser-acl.svg)](http://travis-ci.org/mblarsen/vue-browser-acl)
[![Known Vulnerabilities](https://snyk.io/test/github/mblarsen/vue-browser-acl/badge.svg)](https://snyk.io/test/github/mblarsen/vue-browser-acl)
[![NPM version](http://img.shields.io/npm/v/vue-browser-acl.svg)](https://www.npmjs.com/package/vue-browser-acl) [![](https://img.shields.io/npm/dm/vue-browser-acl.svg)](https://www.npmjs.com/package/vue-browser-acl)
[![Donate](https://img.shields.io/badge/%24-donate-red.svg)](https://freewallet.org/id/mblarsen/btc)
[![chat](https://img.shields.io/badge/chat-on%20discord-7289DA.svg?style=flat-square)](https://discord.gg/fg7c4SC)

> Easy ACL in Vue for better UX. Build on top of the [browser-acl](https://github.com/mblarsen/browser-acl) package.

* Easily manage permissions with [browser-acl](https://github.com/mblarsen/browser-acl) using rules and/or policies
* Adds `v-can` directive with simple syntax: `v-can:create="'Post'"` (the class) and `v-can:edit="post"` an instance on the component
* Adds `$can` and `$can.not` helper function to the Vue prototype (optional)
* Can be used to **hide** `v-can` or to **disable** `v-can.disable`
* Can be used on collections `v-can.some` or `v-can.every`
* Can be used with **vue-router** to guard routes
* Works with **vuex** and plain objects

For more background on the "syntax design" read this short article: [Vue user permissions through directives](https://codeburst.io/reusable-vue-directives-v-can-753bf54e563f).

## Examples

```vue
<!-- Like v-if removes button if user does not have permission to transfer repo -->
<button v-can:transfer="repo">Transfer</button>

<!-- disables button if user does not have permission to transfer repo -->
<button v-can:transfer.disable="repo">Transfer</button>

<!-- string syntax, repo instance in context, Repo is the class -->
<button v-can="'transfer repo'">Transfer</button>
<button v-can="'create Repo'">Transfer</button>

<!-- Send additional arguments (array flavor)-->
<button v-can="['transfer', repo, otherArgs]">Transfer</button>

<!-- Only show if user can edit at least one of the players -->
<table v-can.some="['edit', players]">

<!-- Only show if the user can sell all players -->
<button v-can:sell.every="players">Sell team</button>
```

Router and helper examples are available below.

## Install

```javascript
yarn add vue-browser-acl
```

## Setup

```javascript
import Vue from 'vue'
import Acl from 'vue-browser-acl'

// example user from backend, you can provide a function
// instead in case the user retrieved asynchronously
const user = window.__INITIAL_STATE__.user

Vue.use(Acl, user, (acl) => {
  acl.rule('view', Post)
  acl.rule(['edit', 'delete'], Post, (user, post) => post.userId === user.id)
  acl.rule('moderate', Post, (user) => user.isModerator())
})
```

You can pass in an actual user or a function that returns the users. This is
useful if you don't have the user available right away if for instance it is
fetched asynchronously.

The second param is a callback that let's you define the rules. Alternatively you can pass
a [preconfigured acl](https://github.com/mblarsen/browser-acl#setup) from
the `browser-acl` package. This may be the better choice depending on your
source bundling approach.

See [browser-acl setup](https://github.com/mblarsen/browser-acl) for how to define rules and policies.

As an optional third parameter you can pass an [options](#options) object.

### Plain objects vs function/class

The above describes setup in applications where you use ES6 classes or named
constructor functions to represent your models. If you use plain objects,
however, you'll have to provide a function that maps the input to string
representation of what the object is.

In this example it is assumed that you have a property type on your object:

```javascript
acl.subjectMapper = s => typeof s === 'string' ? s : s.type
```

E.g. a post:

```javascript
{
    type: 'Post',   // <-- this would be used to determine what rules to apply
    title: 'ACL in the front-end',
    author: 'Wow 🦀'
}
```

See the details in browser-acl [Subject mapper section](https://github.com/mblarsen/browser-acl#subjectmapper).

## Usage

You can use the module as directive, with vue-router, and as a helper function.

### Directive

The `v-can` directive can be used in three different flavors and you can apply one or more modifiers
that alters the behavior of the directive.

#### Flavors

There are three different flavors, that to some degree can be mixed: array, string, and argument. For
most cases the _argument flavor_ would be the preferred syntax.

##### Array flavor

Verb, subject and optional parameters are passed as an array as the value for the directive.

```vue
<button v-can="['create', 'Post']">New</button>
<button v-can="['edit', post]">Edit</button>
<button v-can="['delete', comment, post]">Delete</button>
```

All arguments from the third and onwards will be passed to the ACL for evaluation.

Pros:

- Let's you pass additional arguments
- The vue compiler throws errors if you use something that doesn't exist on the component

Cons:

- Doesn't read so easily when skimming the markup

##### String flavor

Verb and subject is combined in a string like `create Post` or `edit post` which makes
up the value of the directive.

```vue
<button v-can="'create Post'">Create</button>
<button v-can="'edit post'">Edit</button>
```

The string `create Post` is interpreted as the verb 'create' on the subject with name
'Post' (a class name).  The string `edit post` is interpreted as the verb 'edit' on
the subject that is a property on the component.

Pros:

- Easy to read

Cons:

- Cannot take additional arguments
- Since the value is a string you lose the vue-compiler errors if you refer to something
  that doesn't exist.

##### Argument flavor

In this flavor the verb is passed as an argument to the directive and for the value can
use either string or array flavor with the verb removed. Additionally the value can be a
plain subject object as well.

```vue
<button v-can:create="'Post'">New</button>
<button v-can:edit="'post'">Edit</button>
<button v-can:edit="post">Edit</button>
<button v-can:delete="[comment, post]">Delete</button>
```

Pros:

- Easy to read for simple cases
- Flexible value syntax
- The vue compiler throws errors if you use something that doesn't exist on the component

Cons:

- Can be slightly harder to comprehend as you make use of modifiers.

#### Modifiers

There are four modifiers. Two that affects the element (hide, disable) and two that let's
you evaluate multiple subjects at once (some, every).

```vue
<button v-can.disable="'delete post'">Delete</button>
<button v-can:delete.disable="post">Delete</button>
<button v-can:delete.disable.some="posts">Delete</button>
```

Modifiers are applied after the directive (first line) or argument (second line) and
separated by a dot (third line) if several modifiers are used.

##### `hide` modifier

The hide modifier is also the default behavior so there is no need to apply it unless you
want to explicitly state the behavior. It works like `v-if` by removing the component from
the DOM.

```vue
<button v-can="'delete post'">Delete</button>
<button v-can.hide="'delete post'">Delete</button>
```

The above two lines has the same effect.

##### `disable` modifier

The disable modifier applies the `disabled` argument to the tag, e.g. to disable a button that
you are not allowed to use.

```vue
<button v-can.disable="'delete post'">Delete</button>
```

##### `not` modifier

The not modifier reverses the query. In this example only if you cannot delete the job the div
element is shown.

```vue
<div v-can:delete.not="job">Ask someone with permission to delete job</div>
```

##### `some` and `every` modifiers

The `some` and `every` arguments takes multiple subjects and will apply the same verb to all of
them.

```vue
<table v-can.some="['edit', players]">
<button v-can:sell.every="players">Sell team</button>
<button v-can:delete.some="[project, sprintBoard]">Delete</button>
```

Note that the subjects do not need to be the some kind. In the third example above the delete
button becomes visible if you either have delete permission on the project (think project owner)
or you have it on the sprint board itself (a user with less permissions).

See [browser-acl](https://github.com/mblarsen/browser-acl) for more info on how to use them.

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

You can negate `$can` with `$can.not`.

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

##### Default fail route

By default if you omit the 'fail' property from the a routes meta a failed
check will redirect to `/`. You can change this behaviour by setting the option
`failRoute`.

This is useful if you use the library in an authentication flow. E.g. by
setting it to `/login`.

You can also use an object for more options ([see guards section in docs](https://router.vuejs.org/en/advanced/navigation-guards.html)):

```
failRoute: {path: '/login': replace: true}
```

This will use replace rather than push when redirecting to the login page.

##### `$from`

You can set the failRoute to the special value `$from` which will return the user to wherever they came from

##### Global rules

You can also use [global rules](https://github.com/mblarsen/browser-acl#additional-parameters-and-global-rules)
in your routes.

However when running in strict mode you have to be explicit about using these in your routes.

```javascript
{
  path: 'village/:villageId',
  component: Pillager,
  meta: {
    can: 'pillage'
  }
}
```

In strict mode:

```javascript
import {GlobalRule} from 'browser-acl'
...
{
  path: 'village/:villageId',
  component: Pillager,
  meta: {
    can: `pillage ${GlobalRule}`
  }
}
```

See options below.

## Options

### assumeGlobal
`default: true`

When true you can use [global
rules](https://github.com/mblarsen/browser-acl#additional-parameters-and-global-rules)
in your routes without explicitly marking them as global.

Note: In strict mode this is turned of. You can override this by explicitly
setting assumeGlobal to true.

### acl
`default: {}`

Options object passed to the Acl contructor.

### caseMode
`default: true`

Assume case means that an upper case subject is the name of a class or a constructor function and that a lower case subject
is the component member name of an instance of that class.

E.g. if subject is `post` the directive will try to look up the data member `post` on the component.

If `caseMode` is set to false this behavior is disabled and `post` will be treated as a subject name.

### directive
`default: can`

The name of the directive. E.g. `can` produces a directive called `v-can` and a helper function called `$can`.

You'll most likely only use this if you want to replace this module with an existing one that uses a different name.

### failRoute
`default: /`

### helper
`default: true`

Adds `$can`, `$can.not`, `$can.some`, and `$can.every` helper function to the Vue prototype when `true`.

### router
`default: undefined`

Pass in a router instance if you want to make use of the ACL functionality in routers.

### strict
`default: false`

When set to true a route without `meta.can` will automatically fail. In addition the setting
will cascade to the Acl settings, making these equivalent:

```javascript
Vue.use(Acl, user, acl => {...}, {strict: true}}
Vue.use(Acl, user, acl => {...}, {strict: true, acl: {strict: true}}
```

You can override this behavior like this:

```javascript
Vue.use(Acl, user, acl => {...}, {strict: true, acl: {strict: false}}
```

## Limitation

The directive does not work on `<template>` but you can still use a `v-if` and the `$can` helper function.

## Related

These are related projects with different approaches:

* [`vue-kindergarten`](https://github.com/JiriChara/vue-kindergarten) uses a powerful sandbox pattern. Integrates with Nuxt.js
* [`vue-acl`](https://github.com/leonardovilarinho/vue-acl) rather than saying what you can do you tell what the role is needed to perform an action.
* [`casl-vue`](https://github.com/stalniy/casl/tree/master/packages/casl-vue)
