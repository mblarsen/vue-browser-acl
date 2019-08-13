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
        propsData: {
          post: new Post({owner: 42})
        }
      }
    )
    expect(wrapper.html()).toContain('Edit')
  })
})
