import Acl from 'browser-acl'

import User from './models/User'
import Post from './models/Post'

const acl = new Acl({strict: true})

acl.rule('edit', Post, function (user, post) {
  return user.type !== 'guest' && // only non-guests
    post.author === user.name ||  // owners
    user.type === 'moderator'     // and moderators can edit
})

export default acl
