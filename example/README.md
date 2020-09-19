# Usage

```
npm i
npm run watch
```

Use the user-selector in the bottom right part of the screen to log in as users
of different groups.

# In this demo

- The user object is loaded asyncroniously (see [`src/index.js`](src/index.js))
- Routes can have asyncronious checks too (see [`/src/router`](src/router/index.js))
- Different user types has different permissions (e.g. group or owner of resource)
- Use of rules vs policies (see [`src/index.js`](src/index.js#L44))
- Use of `beforeAll` (see [`PostPolicy`](src/index.js#L18))
- Show the use of 'fail' as a function with purpose of implementing redirect
  after login

> Enable logging `localStorage.debug="demo*"` then refresh and watch the console.

# Not in this demo

- nested routes
- passing additional parameters

# About

App is based on:

- [PWA](https://pwa.cafe/) [VueJS preset](https://github.com/lukeed/pwa/tree/master/packages/preset-vue)
- Vuex [shopping cart](https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart) example
