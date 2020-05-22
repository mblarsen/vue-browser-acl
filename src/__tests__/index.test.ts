import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { User } from '../../types'
import Acl from 'browser-acl'
import { Verb } from '../../types'
import VueAcl from '../index'

let _user: User | null

const setUser = (user: User | null) => (_user = user)
const unsetUser = () => (_user = null)
const getUser = () => _user

const HIDDEN_STR = '<!-- -->'

class Post {
  id: any
  owner: any

  constructor(data: any) {
    this.id = data.id
    this.owner = data.owner
  }
}

describe('Bad setup', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error')
    // @ts-ignore
    console.error.mockImplementation(() => {})
  })

  afterEach(() => {
    // @ts-ignore
    console.error.mockRestore()
  })

  test('Missing user', () => {
    const localVue = createLocalVue()
    unsetUser()
    const init = () => {
      localVue.use(VueAcl, getUser, (acl: Acl) => {
        acl.rule('delete', (user: User) => user.id === 1)
      })
      // @ts-ignore
      const wrapper = mount(
        {
          template: `<div v-can:delete>Delete</div>`,
        },
        { localVue },
      )
    }
    expect(init).toThrow("Cannot read property 'id' of null")
    // expect(wrapper.html()).toContain('delete')
  })
})

describe('Global rules', () => {
  test('True for all', () => {
    const localVue = createLocalVue()
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.rule('idle', true)
    })
    const wrapper = mount(
      {
        template: `
      <div>
        <div v-can:idle>Idle</div>
      </div>
      `,
      },
      { localVue },
    )
    expect(wrapper.html()).toContain('Idle')
  })
  test('Can post if signed in: true', () => {
    const localVue = createLocalVue()
    setUser({})
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.rule('post', (user: User) => user)
    })
    const wrapper = mount(
      {
        template: `
      <div>
        <div v-can:post>Post</div>
      </div>
      `,
      },
      { localVue },
    )
    expect(wrapper.html()).toContain('Post')
  })
  test('Can post if signed in: false', () => {
    const localVue = createLocalVue()
    unsetUser()
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.rule('post', (user: User) => Boolean(user))
    })
    const wrapper = mount(
      {
        template: `
      <div>
        <div v-can:post>Post</div>
      </div>
      `,
      },
      { localVue },
    )
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
})
describe('Simple rules', () => {
  test('Can edit if owner: false', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })
    const Component = {
      props: ['post'],
      template: `
      <div> <div v-can:edit="post">Edit</div> </div>
      `,
    }
    const wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        post: new Post({ owner: 2 }),
      },
    })
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
  test('Can edit if owner: true', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })
    const Component = {
      props: ['post'],
      template: `
      <div> <div v-can:edit="post">Edit</div> </div>
      `,
    }
    const wrapper = shallowMount(Component, {
      localVue,
      propsData: { post: new Post({ owner: 42 }) },
    })
    expect(wrapper.html()).toContain('Edit')
  })
})
describe('disable', () => {
  test('Is there but disabled', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })

    const Component = {
      props: ['post'],
      template: `
      <div> <button id="edit" v-can:edit.disable="post">Edit</button> </div>
      `,
    }

    const wrapper = shallowMount(Component, {
      localVue,
      propsData: { post: new Post({ owner: 43 }) },
    })
    expect(wrapper.find('#edit').attributes('disabled')).toBe('')

    setUser({ id: 43 })
    const wrapper2 = shallowMount(Component, {
      localVue,
      propsData: { post: new Post({ owner: 43 }) },
    })
    expect(wrapper2.find('#edit').attributes('disabled')).toBe(undefined)
  })
})
describe('readOnly', () => {
  test('Is there but readOnly', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })

    const Component = {
      props: ['post'],
      template: `
      <div> <input id="edit" v-can:edit.readonly="post">Edit</input> </div>
      `,
    }

    const wrapper = shallowMount(Component, {
      localVue,
      propsData: { post: new Post({ owner: 43 }) },
    })
    expect(wrapper.find('#edit').attributes('readonly')).toBe('')

    setUser({ id: 43 })
    const wrapper2 = shallowMount(Component, {
      localVue,
      propsData: { post: new Post({ owner: 43 }) },
    })
    expect(wrapper2.find('#edit').attributes('readonly')).toBe(undefined)
  })
})
describe('Policies', () => {
  test('Object policy', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    const PostPolicy = {
      edit(user: User, post: Post) {
        return user.id === post.owner
      },
    }
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.policy(PostPolicy, Post)
    })
    const Component = {
      props: ['post'],
      template: `<div><div v-can:edit="post">Edit</div></div>`,
    }
    const wrapper = shallowMount(Component, {
      localVue,
      propsData: { post: new Post({ owner: 42 }) },
    })
    expect(wrapper.html()).toContain('Edit')
  })
  test('Object policy: beforeAll', () => {
    const localVue = createLocalVue()
    const PostPolicy = {
      beforeAll(_verb: Verb, user: User) {
        if (!user) {
          return false
        } else if (user.admin) {
          return true
        }
        // return void
      },
      edit(user: User, post: Post) {
        return user.id === post.owner
      },
    }
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.policy(PostPolicy, Post)
    })
    const Component = {
      props: ['post'],
      template: `<div><div v-can:edit="post">Edit</div></div>`,
    }
    const post = new Post({ owner: 42 })

    setUser({ id: 1, admin: true })
    const wrapper = shallowMount(Component, { localVue, propsData: { post } })
    expect(wrapper.html()).toContain('Edit')

    setUser(null)
    const wrapper2 = shallowMount(Component, { localVue, propsData: { post } })
    expect(wrapper2.html()).toContain(HIDDEN_STR)

    setUser({ id: 1 })
    const wrapper3 = shallowMount(Component, { localVue, propsData: { post } })
    expect(wrapper3.html()).toContain(HIDDEN_STR)

    setUser({ id: 42 })
    const wrapper4 = shallowMount(Component, { localVue, propsData: { post } })
    expect(wrapper4.html()).toContain('Edit')
  })
})
describe('Manyies', () => {
  test('Some: one', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })
    const Component = {
      props: { posts: { type: Array, required: true } },
      template: ` <div> <div v-can:edit.some="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        posts: [new Post({ owner: 42 }), new Post({ owner: 2 })],
      },
    })
    expect(wrapper.html()).toContain('Edit')
  })
  test('Some: none', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })
    const Component = {
      props: { posts: { type: Array, required: true } },
      template: ` <div> <div v-can:edit.some="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        posts: [new Post({ owner: 3 }), new Post({ owner: 2 })],
      },
    })
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
  test('Every: one', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })
    const Component = {
      props: { posts: { type: Array, required: true } },
      template: ` <div> <div v-can:edit.every="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        posts: [new Post({ owner: 42 }), new Post({ owner: 2 })],
      },
    })
    expect(wrapper.html()).toContain(HIDDEN_STR)
  })
  test('Every: all', () => {
    const localVue = createLocalVue()
    setUser({ id: 42 })
    localVue.use(VueAcl, getUser, (acl: Acl) => {
      acl.register(Post, 'Post')
      acl.rule('edit', Post, (user: User, post: Post) => user.id === post.owner)
    })
    const Component = {
      props: { posts: { type: Array, required: true } },
      template: ` <div> <div v-can:edit.every="posts">Edit</div> </div> `,
    }
    const wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        posts: [new Post({ owner: 42 }), new Post({ owner: 42 })],
      },
    })
    expect(wrapper.html()).toContain('Edit')
  })
})
