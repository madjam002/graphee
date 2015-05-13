import React from 'react'
import Graphee from 'graphee'
import _ from 'lodash'
import db from './db'
import CodeMirror from 'react-code-mirror'

import User from './graph/user'

export default class Example extends React.Component {

  constructor() {
    super()

    this.state = {
      query: `user(id: me) {
  name,
  birthDate,
  friends(first: 2) {
    totalCount,
    edges {
      node {
        name
      }
    }
  }
}`
    }

    this.app = new Graphee()
  }

  async submit() {
    console.log('parsing query', this.state.query)
    let result = await this.app.process(this.state.query, {}, async def => {
      let response = {}

      switch (def.type) {
        case 'user':
          let id = def.params.id

          // current user?
          if (id === 'me') {
            // set id to id of current user (1 in this example)
            id = 1
          }

          let user = _.find(db.users, {id: id})
          response[def.params.id] = new User(user)
          break
      }

      return response
    })

    this.setState({ result: JSON.stringify(result, null, 2) })
  }

  onChange(e) {
    this.setState({query: e.target.value})
  }

  componentDidMount() {
    this.submit()
  }

  pageKeyPress(e) {
    if (e.shiftKey && e.key === 'Enter') {
      this.submit()
      e.preventDefault()
    }
  }

  render() {
    return (
      <div style={styles.container} onKeyPress={this.pageKeyPress.bind(this)}>
        <div className="container-fluid">
          <div className="jumbotron text-center" style={styles.jumbotron}>
            <h1>Graphee</h1>
            <p>Start using GraphQL today</p>
            <kbd>$ npm install graphee</kbd>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.column}>
            <h3>Graph QL Query</h3>
            <CodeMirror lineNumbers={true} tabSize={2} indentWithTabs={false} style={styles.textarea} onChange={this.onChange.bind(this)} defaultValue={this.state.query} />
          </div>
          <div style={styles.column}>
            <h3>Results</h3>
            <CodeMirror lineNumbers={true} mode="json-ld" style={styles.textarea} value={this.state.result} readOnly={true} />
          </div>
        </div>

        <br />

        <button style={styles.button} onClick={this.submit.bind(this)} className="btn btn-lg btn-primary btn-block">Submit (Shift+Enter)</button>

        <p className="text-center">
          View the contents of the database at <a href="https://raw.githubusercontent.com/madjam002/graphee/gh-pages/js/db.js" target="_blank">https://raw.githubusercontent.com/madjam002/graphee/gh-pages/js/db.js</a>
        </p>
      </div>
    )
  }

}

let styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    height: '100%',
  },
  jumbotron: {
    padding: '10px 100px 30px 100px',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    display: 'flex',
    marginRight: -10,
    minHeight: 600,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingRight: 10,
  },
  textarea: {
    flex: 1,
  },
  button: {
    fontSize: 15,
    padding: 10,
  },
}
