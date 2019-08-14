import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import VueAcl from '../index.js'

let _user = null
const setUser = user => _user = user
const getUser = () => _user

const HIDDEN_STR = '<!-- -->'

// class User {}
// class Apple {}
// class Job {
//   constructor(data) {
//     Object.assign(this, data || {})
//   }
// }

class Post {
  constructor(data) {
    this.id = data.id
    this.owner = data.owner
  }
}

describe('Bad setup', () => {

  beforeEach(() => {
    jest.spyOn(console, 'error')
    console.error.mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  test('Missing user', () => {
    const localVue = createLocalVue()
    setUser(null)
    const init = () => {
      localVue.use(VueAcl, getUser, (acl) => {
        acl.rule('delete', user => user.id === 1)
      })
      const wrapper = mount({
        template: `<div v-can:delete>Delete</div>`,
      }, { localVue })
    }
    expect(init).toThrow("Cannot read property 'id' of null")
    // expect(wrapper.html()).toContain('delete')
  })
})

describe('Global rules', () => {
  test('True for all', () => {
    const localVue = createLocalVue()
    localVue.use(VueAcl, getUser, (acl) => {
      acl.rule('idle', true)
    })
    const wrapper = mount({
      template: `
      <div>
        <div v-can:idle>Idle</div>
      </div>
      `,
    }, { localVue })
    expect(wrapper.html()).toContain('Idle')
  })
  test('Can post if signed in: false', () => {
    const localVue = createLocalVue()
    localVue.use(VueAcl, getUser, (acl) => {
      acl.rule('post', user => user)
    })
    const wrapper = mount({
      template: `
      <div>
        <div v-can:post>Post</div>
      </div>
      `,
    }, { localVue })
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
  test('Can post if signed in: true', () => {
    const localVue = createLocalVue()
    setUser(true)
    localVue.use(VueAcl, getUser, (acl) => {
      acl.rule('post', user => user)
    })
    const wrapper = mount({
      template: `
      <div>
        <div v-can:post>Post</div>
      </div>
      `,
    }, { localVue })
    expect(wrapper.html()).toContain('Post')
  })
})
describe('Simple rules', () => {
  test('Can edit if owner: false', () => {
    const localVue = createLocalVue()
    setUser({id: 42})
    localVue.use(VueAcl, getUser, (acl) => {
      acl.rule('edit', Post, (user, post) => user.id === post.owner)
    })
    const Component = {
      props: ['post'],
      template: `
      <div> <div v-can:edit="post">Edit</div> </div>
      `,
    }
    const wrapper = shallowMount(
      Component,
      {
        localVue,
        propsData: {
          post: new Post({owner: 2})
        }
      }
    )
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
  test('Can edit if owner: true', () => {
    const localVue = createLocalVue()
    setUser({id: 42})
    localVue.use(VueAcl, getUser, (acl) => {
      acl.rule('edit', Post, (user, post) => user.id === post.owner)
    })
    const Component = {
      props: ['post'],
      template: `
      <div> <div v-can:edit="post">Edit</div> </div>
      `,
    }
    const wrapper = shallowMount(
      Component,
      {
        localVue,
        propsData: { post: new Post({owner: 42}) }
      }
    )
    expect(wrapper.html()).toContain('Edit')
  })
})
describe('Policies', () => {
  test('Object policy', () => {
    const localVue = createLocalVue()
    setUser({id: 42})
    const PostPolicy = {
      edit(user, post) {
        return user.id === post.owner
      }
    }
    localVue.use(VueAcl, getUser, (acl) => {
      acl.policy(PostPolicy, Post)
    })
    const Component = {
      props: ['post'],
      template: `<div><div v-can:edit="post">Edit</div></div>`,
    }
    const wrapper = shallowMount(
      Component,
      {
        localVue,
        propsData: { post: new Post({owner: 42}) }
      }
    )
    expect(wrapper.html()).toContain('Edit')
  })
  test('Object policy: beforeAll', () => {
    const localVue = createLocalVue()
    const PostPolicy = {
      beforeAll(verb, user) {
        if (!user) {
          return false
        } else if (user.admin) {
          return true
        }
        // return void
      },
      edit(user, post) {
        return user.id === post.owner
      }
    }
    localVue.use(VueAcl, getUser, (acl) => {
      acl.policy(PostPolicy, Post)
    })
    const Component = {
      props: ['post'],
      template: `<div><div v-can:edit="post">Edit</div></div>`,
    }
    const post = new Post({owner: 42})

    setUser({id: 1, admin: true})
    const wrapper = shallowMount( Component, { localVue, propsData: { post } })
    expect(wrapper.html()).toContain('Edit')


    setUser(null)
    const wrapper2 = shallowMount( Component, { localVue, propsData: { post } })
    expect(wrapper2.html()).toContain(HIDDEN_STR)


    setUser({id: 1})
    const wrapper3 = shallowMount( Component, { localVue, propsData: { post } })
    expect(wrapper3.html()).toContain(HIDDEN_STR)


    setUser({id: 42})
    const wrapper4 = shallowMount( Component, { localVue, propsData: { post } })
    expect(wrapper.html()).toContain('Edit')
  })
})
describe('Manyies', () => {
  test('Some: one', () => {
    const localVue = createLocalVue()
    setUser({id: 42})
    localVue.use(VueAcl, getUser, (acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user, post) => user.id === post.owner)
    })
    const Component = {
      props: {posts: {type: Array, required: true}},
      template: ` <div> <div v-can:edit.some="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(
      Component,
      {
        localVue,
        propsData: {
          posts: [
            new Post({owner: 42}),
            new Post({owner: 2}),
          ]
        }
      }
    )
    expect(wrapper.html()).toContain('Edit')
  })
  test('Some: none', () => {
    const localVue = createLocalVue()
    setUser({id: 42})
    localVue.use(VueAcl, getUser, (acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user, post) => user.id === post.owner)
    })
    const Component = {
      props: {posts: {type: Array, required: true}},
      template: ` <div> <div v-can:edit.some="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(
      Component,
      {
        localVue,
        propsData: {
          posts: [
            new Post({owner: 3}),
            new Post({owner: 2}),
          ]
        }
      }
    )
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
  test('Every: one', () => {
    const localVue = createLocalVue()
    setUser({id: 42})
    localVue.use(VueAcl, getUser, (acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user, post) => user.id === post.owner)
    })
    const Component = {
      props: {posts: {type: Array, required: true}},
      template: ` <div> <div v-can:edit.every="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(
      Component,
      {
        localVue,
        propsData: {
          posts: [
            new Post({owner: 42}),
            new Post({owner: 2}),
          ]
        }
      }
    )
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
  test('Every: all', () => {
    const localVue = createLocalVue()
    setUser({id: 42})
    localVue.use(VueAcl, getUser, (acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user, post) => user.id === post.owner)
    })
    const Component = {
      props: {posts: {type: Array, required: true}},
      template: ` <div> <div v-can:edit.every="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(
      Component,
      {
        localVue,
        propsData: {
          posts: [
            new Post({owner: 42}),
            new Post({owner: 42}),
          ]
        }
      }
    )
    expect(wrapper.html()).toContain('Edit')
  })
})
