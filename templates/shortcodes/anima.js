window.addEventListener('load', (event) => {
  for (let json of document.getElementsByClassName('anima-data')) {
    const data = JSON.parse(json.text)
    json.insertAdjacentElement(
      'afterend',
      new Puzzle({
        data,
        scale: 50,
      })
    )
  }
})

class CustomElement extends HTMLElement {
  constructor (name, props, data) {
    super()

    const template = document.getElementById(name + '-template')
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true))

    this.refs = {}
    for (let ref of this.shadowRoot.querySelectorAll('[data-ref]')) {
      this.refs[ref.getAttribute('data-ref')] = ref
    }

    this._props = props || this.props
    Object.defineProperty(this, 'props', {
      get () {
        return this._props
      },
      set (value) {
        this._props = value
        this.update()
      }
    })

    if (data != null) {
      for (let key in data) {
        this[key] = data[key]
      }
    }

    if (this._props !== undefined) {
      this.update()
    }
  }

  update () {}
}

class Actor extends CustomElement {
  constructor (props) {
    super('anima-actor', props)
  }

  update () {
    switch (this.props.color) {
      case 'red':
        this.classList.add('red')
        break
      case 'blue':
        this.classList.add('blue')
        break
      default:
        throw new Error(`Invalid color ${this.props.color}`)
    }

    this.style.width = `${100 / this.props.boardWidth}%`
    this.style.height = `${100 / this.props.boardHeight}%`
    this.style.left = `${this.props.x * 100 / this.props.boardWidth}%`
    this.style.bottom = `${this.props.y * 100 / this.props.boardHeight}%`
  }
}
window.customElements.define('anima-actor', Actor)

class Puzzle extends CustomElement {
  constructor (props) {
    super('anima-puzzle', props)

    this.deactivate()

    this.refs.board.addEventListener('focus', e => this.activate())
    this.refs.board.addEventListener('blur', e => this.deactivate())
    document.addEventListener('keydown', e => this.onKeyDown(e))

    this.history = []
  }

  update () {
    this.refs.name.textContent = this.props.data.name

    this.refs.optimalCount.textContent = `${this.props.data.minMoves}`

    this.refs.board.style.width = `${this.props.data.width * this.props.scale}px`
    this.refs.board.style.height = `${this.props.data.height * this.props.scale}px`

    this.refs.board.innerHTML = ''

    for (let x = 0; x < this.props.data.width; ++x) {
      for (let y = 0; y < this.props.data.height; ++y) {
        let tile = this.tile(x, y)
        if (tile !== ' ') {
          let div = document.createElement('div')

          div.classList.add('tile')
          div.style.width = `${100 / this.props.data.width}%`
          div.style.height = `${100 / this.props.data.height}%`
          div.style.left = `${100 * x / this.props.data.width}%`
          div.style.bottom = `${100 * y / this.props.data.height}%`

          if (tile === 'r') {
            div.classList.add('goal')
            div.classList.add('red')
          }
          if (tile === 'b') {
            div.classList.add('goal')
            div.classList.add('blue')
          }

          this.refs.board.append(div)
        }
      }
    }

    this.actors = []
    for (let dataActor of this.props.data.actors) {
      let actor = new Actor({
        x: dataActor.x,
        y: dataActor.y,
        color: dataActor.color,
        boardWidth: this.props.data.width,
        boardHeight: this.props.data.height,
      })
      this.actors.push(actor)
      this.refs.board.appendChild(actor)
    }
  }

  tile (x, y) {
    if (x < 0 || x >= this.props.data.width || y < 0 || y >= this.props.data.height) {
      return null
    } else {
      return this.props.data.tiles[this.props.data.height - y - 1][x]
    }
  }

  activate () {
    this.active = true
    this.classList.add('active')
  }

  deactivate () {
    this.active = false
    this.classList.remove('active')
  }

  onKeyDown (e) {
    if (!this.active) {
      return
    }

    switch (e.code) {
      case 'ArrowRight':
      case 'KeyD':
        this.move(1, 0)
        e.preventDefault()
        break
      case 'ArrowUp':
      case 'KeyW':
        this.move(0, 1)
        e.preventDefault()
        break
      case 'ArrowLeft':
      case 'KeyA':
        this.move(-1, 0)
        e.preventDefault()
        break
      case 'ArrowDown':
      case 'KeyS':
        this.move(0, -1)
        e.preventDefault()
        break
      case 'Space':
      case 'KeyZ':
        this.undo()
        e.preventDefault()
        break
      case 'KeyR':
        this.reset()
        e.preventDefault()
        break
      case 'Escape':
        this.refs.board.blur()
        e.preventDefault()
        break
      default:
        break
    }
  }

  move (x, y) {
    let nextPos = []
    for (let actor of this.actors) {
      let nx = actor.props.x
      let ny = actor.props.y
      switch (actor.props.color) {
        case 'red':
          nx += x
          ny += y
          break
        case 'blue':
          nx += -x
          ny += -y
          break
        default:
          throw new Error('Invalid color')
      }

      let tile = this.tile(nx, ny)
      if (tile === ' ' || tile == null) {
        nx = actor.props.x
        ny = actor.props.y
      }

      nextPos.push({
        x: nx,
        y: ny,
      })
    }

    let finished = false
    while (!finished) {
      finished = true
      for (let i = 0; i < nextPos.length; ++i) {
        for (let j = i + 1; j < nextPos.length; ++j) {
          if (nextPos[i].x === nextPos[j].x && nextPos[i].y === nextPos[j].y) {
            nextPos[i] = {
              x: this.actors[i].props.x,
              y: this.actors[i].props.y,
            }
            nextPos[j] = {
              x: this.actors[j].props.x,
              y: this.actors[j].props.y,
            }
            finished = false
          }
        }
      }
    }

    let anyChanged = false
    for (let i = 0; i < nextPos.length; ++i) {
      let actor = this.actors[i]
      if (actor.props.x != nextPos[i].x || actor.props.y != nextPos[i].y) {
        anyChanged = true
      }

      actor.props = {
        x: nextPos[i].x,
        y: nextPos[i].y,
        color: actor.props.color,
        boardWidth: actor.props.boardWidth,
        boardHeight: actor.props.boardHeight,
      }
    }

    if (anyChanged) {
      this.history.push(nextPos)
      this.updateDisplay()
    }
  }

  undo () {
    this.history.pop()

    if (this.history.length != 0) {
      let positions = this.history[this.history.length - 1]
      for (let i = 0; i < this.actors.length; ++i) {
        let actor = this.actors[i]
        actor.props = {
          x: positions[i].x,
          y: positions[i].y,
          color: actor.props.color,
          boardWidth: actor.props.boardWidth,
          boardHeight: actor.props.boardHeight,
        }
      }
    } else {
      for (let i = 0; i < this.actors.length; ++i) {
        let actor = this.actors[i]
        actor.props = {
          x: this.props.data.actors[i].x,
          y: this.props.data.actors[i].y,
          color: actor.props.color,
          boardWidth: actor.props.boardWidth,
          boardHeight: actor.props.boardHeight,
        }
      }
    }

    this.updateDisplay()
  }

  reset () {
    if (this.history.length < 20) {
      let interval = setInterval(() => {
        if (this.history.length == 0) {
          clearInterval(interval)
        } else {
          this.undo()
        }
      }, 100)
    } else {
      this.history = []
      this.undo()
    }
  }

  isSolved () {
    for (let x = 0; x < this.props.data.width; ++x) {
      for (let y = 0; y < this.props.data.height; ++y) {
        let tile = this.tile(x, y)
        if (tile == 'r' || tile == 'b') {
          let met = false
          for (let actor of this.actors) {
            if (actor.props.x == x && actor.props.y == y) {
              if (tile == 'r' && actor.props.color == 'red') {
                met = true
                break
              } else if (tile == 'b' && actor.props.color == 'blue') {
                met = true
                break
              }
            }
          }
          if (!met) {
            return false
          }
        }
      }
    }

    return true
  }

  updateDisplay () {
    if (this.isSolved()) {
      this.classList.add('solved')
    } else {
      this.classList.remove('solved')
    }

    this.refs.moveCount.textContent = `${this.history.length}`
  }
}
window.customElements.define('anima-puzzle', Puzzle)
