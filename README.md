Graphee  [![NPM](https://img.shields.io/npm/v/graphee.svg?style=flat)](https://npmjs.org/package/graphee) ![Downloads](https://img.shields.io/npm/dm/graphee.svg?style=flat)
=======

Graphee allows you to define a GraphQL interface by using [nodes](#nodes) and [edges](#edges).
It is database agnostic, and makes no assumption on how you retrieve your data or what format it's in.

## Online Demo

You can view a fairly simple (work in progress) demo of this library in action here:

https://madjam002.github.io/graphee

The demo above allows you to query a hardcoded data set which can be found here:
https://github.com/madjam002/graphee/blob/gh-pages/js/db.js

## Installation

```sh
$ npm install graphee --save
```

## Usage

*All examples are written in ECMAScript 6 with async-await*

### Nodes

Nodes allow you to wrap objects in your existing application.

```javascript
import {Node} from 'graphee'

export default class User extends Node {

  static mapping = {
    name: (node) => `${node.firstName} ${node.lastName}`,
    firstName: true,
    lastName: true,
    birthDate: 'birthday',

    friends: Node.edge(async (node, def) => {
      // do an async query here to fetch friends
      let friends = await ...

      return {
        totalCount: friends.length,
        edges: friends.map(node => { return { node: new User(node) }})
      }
    })
  }

}
```

In the example above, you can see that a simple static mapping object is defined on the `User` node.

Each field of the mapping object represents a potential field that the client can query for using GraphQL. If the field is simply set to `true`, then a 1-1 mapping is assumed. If it is a string, then the field will map to a field on the wrapped object with the given name.

### Edges

Alternatively, you can define Edges on your Nodes. This allows you to run a function when a field is requested, and then return a result set. The result set is filtered through Graphee, and any `Node`s that are returned will be mapped.

Take the `friends` edge in the above example

```javascript
...

    friends: Node.edge(async (node, def) => {
      // do an async query here to fetch friends
      let friends = await ...

      return {
        totalCount: friends.length,
        edges: friends.map(node => { return { node: new User(node) }})
      }
    })

...
```

Here, we would want to go to the database to fetch an array of friends. Once we have this information, we return a vanilla Javascript Object with the total count, and the edges array which is each friend object wrapped in a `User` node.

A few things are worth mentioning here.
- The object returned by the edge callback will be mapped accordingly. So in the example above, `totalCount` will only be in the response if the user requested that field.
- You should wrap any entities from your database in a `Node` so that it can be efficiently processed by Graphee.

### Querying with GraphQL

*GraphQL is parsed using madjam002/graphqlite*

Once you have defined all of your Node mappings, you can then go on to process a GraphQL query.

Here is an example of how this is done:

```javascript
import Graphee from 'graphee'

let app = new Graphee()

let someQuery = `
  user(id: 5) {
    name
  }
`

let result = await app.process(someQuery, {}, async def => {
  let response = {}

  switch (def.type) {
    case 'user':
      // do async call to fetch user
      let user = async fetchUser({id: def.params.id})

      response[def.params.id] = new User(user)
      break
  }

  return response
})

console.log(result)

```

A few things are going on here. We're passing a GraphQL string to `Graphee::process` which will get processed. The callback which is then passed to the `process` method will then get called for each GraphQL `call` in the query string. You then have full control over what you want to put into the final response based on the type of call and the parameters. Just remember to wrap any entities from the database in a `Node` so that they can be efficiently processed.

## License

Licensed under the MIT License.

View the full license [here](https://raw.githubusercontent.com/madjam002/graphee/master/LICENSE).
