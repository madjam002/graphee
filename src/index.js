import graphqlite from 'graphqlite'
import _ from 'lodash'

import Mapper from './mapper'
import Node from './node'

export default class App {

  static Node = Node

  mappers = []

  // Process GraphQL and return response
  async process(query, request, resolver) {
    if (!resolver) throw 'No resolver callback provided'

    let shape = graphqlite.parse(query)

    let response = {}

    // wait for all definitions to be resolved and mapped
    await Promise.all(shape.map(async def => {
      // call resolver
      let result = await resolver(def)

      if (_.isArray(result)) throw 'Cannot return array at root'

      // run the mapper
      let mapper = new Mapper(this, request)
      await mapper.map(result, def)

      // merge mapper result into the final response
      _.merge(response, mapper.result)
    }))

    // return response
    return response
  }

  // Add mapper callback
  mapper(callback) {
    this.mappers.push(callback)
  }

}
