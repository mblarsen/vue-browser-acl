import Post from '../models/Post.js'
import debug from 'debug'

const log = debug('demo:api:post')

export default class Posts {
  static async all() {
    const response = await fetch('/api/posts')
    const data = await response.json()
    return data.posts.map(p => Post.create(p))
  }
  static async find(id) {
    const response = await fetch(`/api/posts/${id}`)
    const data = await response.json()
    return Post.create(data.posts)
  }
  static async create(props) {
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'posts',
          attributes: props,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    // This particular API returns all posts so
    // we pop the last one we just created
    const { posts: post } = await response.json()
    return Post.create(post)
  }
  static async delete(id) {
    return await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    })
  }
}

export const allPosts = Posts.all
export const findPost = Posts.find
export const createPost = Posts.create
export const deletePost = Posts.delete
