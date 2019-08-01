export default class Comment {
  constructor(props) {
    this.id = props.id
    this.body = props.body
    this.user = props.user
  }
  static create(props) {
    return new Comment(props)
  }
}
