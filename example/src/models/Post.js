export default class Post {
  constructor(props) {
    this.id = props.id
    this.title = props.title
    this.body = props.body
    this.user = props.user
    this.comments = props.comments || []
  }
  addComment(comment) {
    this.comments.push(comment)
  }
  static create(props) {
    return new Post(props)
  }
}
