import _ from 'lodash'

export default class Node {

  constructor(data) {
    _.assign(this, data)
  }

  static edge(callback) {
    return {
      $edge: true,
      callback: callback,
    }
  }

}
