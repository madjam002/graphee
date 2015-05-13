import _ from 'lodash'
import {Node} from 'graphee'
import db from '../db'

export default class User extends Node {

  static mapping = {
    name: true,
    firstName: true,
    lastName: true,
    birthDate: true,

    friends: Node.edge(async (node, def) => {
      // do async query to fetch friends
      // in this example, find friends based on hardcoded data
      let outgoingFriends = _.where(db.friends, { from: node.id }).map(friend => {
        return _.find(db.users, { id: friend.to })
      })

      let incomingFriends = _.where(db.friends, { to: node.id }).map(friend => {
        return _.find(db.users, { id: friend.from })
      })

      let friends = outgoingFriends.concat(incomingFriends)
      let filteredFriends = friends.slice(
        def.params.after || 0,
        ((def.params.after || 0) + def.params.first) || 5
      )

      return {
        totalCount: friends.length,
        edges: filteredFriends.map(node => { return { node: new User(node) }})
      }
    })
  }

}
