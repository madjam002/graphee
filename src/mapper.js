import _ from 'lodash'
import Node from './node'

export default class Mapper {

  constructor(app, request) {
    this.app = app
    this.request = request
    this.result = {}
  }

  // Start the mapping process.
  // Takes an input object and iterates through it until it finds {Node}s.
  // {Node}s are then mapped based on the request shape (GraphQL)
  async map(object, definition) {
    let promises = []

    for (let field in object) {
      if (!_.isObject(object[field])) {
        // field
        this.result[field] = object[field]
      } else if (object[field] instanceof Node) {
        // Node
        this.result[field] = {}
        promises.push(this.mapNode(object[field], this.result[field], definition))
      } else if (_.isArray(object[field])) {
        // generic array of objects
        this.result[field] = []
        object[field].forEach((subObject, i) => {
          this.result[field][i] = {}

          if (subObject instanceof Node) {
            // sub object is Node
            promises.push(this.mapNode(subObject, this.result[field][i], definition))
          } else {
            // sub object is generic object
            promises.push(this.mapObject(subObject, this.result[field][i], definition))
          }
        })
      }
    }

    return Promise.all(promises)
  }

  // Maps a node.
  async mapNode(node, resultCursor, definition) {
    let mapping = node.constructor.mapping
    let promises = []

    // default fields
    resultCursor.id = node.id // TODO allow customisation of id field
    resultCursor.__type__ = node.constructor.type || node.constructor.name

    for (let field in definition.fields) {
      let options = definition.fields[field]

      if (mapping[field]) {
        if (options === true) {
          // field
          promises.push(this.mapField(node, resultCursor, field, mapping[field]))
        } else if (options.fields) {
          // edge
          promises.push(this.mapEdge(node, resultCursor, field, mapping[field], options))
        }
      }
    }

    return Promise.all(promises)
  }

  // Maps a field on a node based on mappers
  async mapField(node, resultCursor, field, mapping) {
    let currentValue = node[field]

    // check that we're not an edge
    if (mapping.$edge) {
      // edge needs to be told which fields to return
      throw 'No fields provided for edge'
    }

    // built in mappers
    if (_.isFunction(mapping) && (field === 'name' || (field !== 'name' && !mapping.name))) {
      // simple callback (not a constructor though)
      currentValue = await mapping(node)
    } else if (_.isString(mapping)) {
      // map field with specified field name
      currentvalue = node[mapping]
    }

    // call mappers
    for (let mapper of this.app.mappers) {
      let result = await mapper(currentValue, mapping, node, field)
      if (result !== undefined)
        currentValue = result
    }

    resultCursor[field] = currentValue
  }

  // Maps an edge on a Node
  async mapEdge(node, resultCursor, field, mapping, definition) {
    if (!mapping || !mapping.$edge) {
      throw 'Invalid edge provided'
    }

    // call edge callback and parse result
    let result = await mapping.callback(node, definition)

    resultCursor[field] = _.isArray(result) ? [] : {}

    await this.mapObject(result, resultCursor[field], definition)
  }

  // Maps a plain object which can contain anything.
  // If a {Node} is found, then it will be mapped accordingly.
  async mapObject(object, resultCursor, definition) {
    let promises = []

    for (let field in definition.fields) {
      let options = definition.fields[field]

      if (options === true && !_.isObject(object[field])) {
        // field
        resultCursor[field] = object[field]
      } else if (options.fields && object[field] instanceof Node) {
        // Node
        resultCursor[field] = {}
        promises.push(this.mapNode(object[field], resultCursor[field], options))
      } else if (options.fields && !_.isArray(object[field])) {
        // generic object
        resultCursor[field] = {}
        promises.push(this.mapObject(object[field], resultCursor[field], options))
      } else if (options.fields && _.isArray(object[field])) {
        // generic array of objects
        resultCursor[field] = []
        object[field].forEach((subObject, i) => {
          resultCursor[field][i] = {}

          if (subObject instanceof Node) {
            // sub object is Node
            promises.push(this.mapNode(subObject, resultCursor[field][i], options))
          } else {
            // sub object is generic object
            promises.push(this.mapObject(subObject, resultCursor[field][i], options))
          }
        })
      }
    }

    return Promise.all(promises)
  }

}
