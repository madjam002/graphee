Graphee  [![NPM](https://img.shields.io/npm/v/graphee.svg?style=flat)](https://npmjs.org/package/graphee) ![Downloads](https://img.shields.io/npm/dm/graphee.svg?style=flat)
=======

Graphee allows you to define a GraphQL interface by using [nodes](#nodes) and [edges](#edges).
It is database agnostic, and makes no assumption on how you retrieve your data.

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


GraphQLite exposes a simple API for parsing GraphQL (example uses ES6 multi-line strings).

```javascript
var graphee = require('graphee')

var output = graphee.parse(`
  node(id: 123) {
    id,
    name,
    birthdate {
      month,
      day,
    },
    friends(first: 1) {
      cursor,
      edges {
        node {
          name
        }
      }
    }
  }
`)

var backToString = graphee.stringify(output)
var pretty = graphee.stringify(output, true)
```

In the above example, `output` will be:

```javascript
[{
  "type": "node",
  "params": {
    "id": 123
  },
  "fields": {
    "id": true,
    "name": true,
    "birthdate": {
      "fields": {
        "month": true,
        "day": true
      }
    },
    "friends": {
      "params": {
        "first": 1
      },
      "fields": {
        "cursor": true,
        "edges": {
          "fields": {
            "node": {
              "fields": {
                "name": true
              }
            }
          }
        }
      }
    }
  }
}]
```

`stringify` takes the output from `parse` and generates a GraphQL string. If no second parameter is provided, the output will be minified. If the second parameter is `true`, the output will be prettified.

## Roadmap
Facebook will be releasing a GraphQL module in the future, but I didn't know what to expect from this
so I created this basic one as an experiment.
Therefore this module could become obselete in the future.

## License

Licensed under the MIT License.

View the full license [here](https://raw.githubusercontent.com/madjam002/graphee/master/LICENSE).
