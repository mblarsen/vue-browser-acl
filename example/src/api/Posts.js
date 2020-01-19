import Post from '../models/Post.js'
import debug from 'debug'

const log = debug('demo:api:post')

const cache = new Map()

export default class Posts {
  static async all() {
    const response = await fetch('https://crudpi.io/7b2f97/post')
    const posts = await response.json()
    return posts.map(p => Post.create(p))
  }
  static async find(id) {
    if (cache.has(id)) {
      log('used cache')
      return cache.get(id)
    }
    const response = await fetch(`https://crudpi.io/7b2f97/post/${id}`)
    const postData = await response.json()
    const post = Post.create(postData)
    cache.set(id, post)
    return post
  }
  static async create(props) {
    const response = await fetch('https://crudpi.io/7b2f97/post', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(props),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    // This particular API returns all posts so
    // we pop the last one we just created
    const posts = await response.json()
    return Post.create(posts.pop())
  }
  static async delete(id) {
    return await fetch(`https://crudpi.io/7b2f97/post/${id}`, {
      method: 'DELETE',
    })
  }
}

export const allPosts = Posts.all
export const findPost = Posts.find
export const createPost = Posts.create
export const deletePost = Posts.delete
