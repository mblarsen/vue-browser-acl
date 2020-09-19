import { Model, Server, belongsTo } from 'miragejs'

export default function makeServer() {
  return new Server({
    fixtures: {
      posts: [
        {
          id: 1,
          title: 'A post',
          body: 'A post body',
          user: 'jane',
          comments: [],
        },
        {
          id: 2,
          title: 'Another post',
          body: 'Another post body',
          user: 'john',
          comments: [],
        },
      ],
    },
    models: {
      posts: Model.extend(),
    },
    routes() {
      this.namespace = '/api'
      this.timing = 500
      this.resource('posts')
    },
  })
}
