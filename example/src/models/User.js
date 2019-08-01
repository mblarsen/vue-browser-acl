export default class User {
  constructor(props) {
    this.id = props.id || this.id
    this.name = props.name
    this.type = props.type
  }
  static create(props) {
    return new User(props)
  }
}
