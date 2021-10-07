window.addEventListener('load', async (event) => {
  await wasm_bindgen('/wasm/anima_solver_bg.wasm')

  for (let json of document.getElementsByClassName('anima-data')) {
    const data = JSON.parse(json.text)
    json.insertAdjacentElement(
      'afterend',
      new Puzzle({
        data,
        scale: Number(json.getAttribute('data-scale')),
        solver: json.getAttribute('data-solver') === 'true',
        import: json.getAttribute('data-import') === 'true'
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

    this.style.width = `${this.props.scale}px`
    this.style.height = `${this.props.scale}px`
    this.style.transform = `translate(${this.props.x * this.props.scale}px, ${(this.props.height - this.props.y - 1) * this.props.scale}px)`
  }
}
window.customElements.define('anima-actor', Actor)

class Puzzle extends CustomElement {
  constructor (props) {
    super('anima-puzzle', props)

    this.deactivate()

    this.refs.board.addEventListener('focus', e => this.activate())
    this.refs.board.addEventListener('blur', e => this.deactivate())

    this.touch = {}
    this.refs.board.addEventListener('touchstart', e => {
      if (this.active) {
        this.touch.startX = e.targetTouches[0].clientX
        this.touch.startY = e.targetTouches[0].clientY
        this.touch.done = false
        e.preventDefault()
      }
    })
    this.refs.board.addEventListener('touchmove', e => {
      if (this.active && !this.touch.done) {
        let dx = e.targetTouches[0].clientX - this.touch.startX
        let dy = e.targetTouches[0].clientY - this.touch.startY

        const SWIPE_DIST = 40
        if (dx < -SWIPE_DIST) {
          this.move(-1, 0)
          this.touch.done = true
        } else if (dx > SWIPE_DIST) {
          this.move(1, 0)
          this.touch.done = true
        } else if (dy < -SWIPE_DIST) {
          this.move(0, 1)
          this.touch.done = true
        } else if (dy > SWIPE_DIST) {
          this.move(0, -1)
          this.touch.done = true
        }

        e.preventDefault()
      }
    })
    this.refs.board.addEventListener('touchend', e => {
      if (this.active && !this.touch.done) {
        this.refs.board.blur()
      }
    })

    document.addEventListener('keydown', e => this.onKeyDown(e))
    this.refs.focuser.addEventListener('click', e => this.refs.board.focus())

    this.refs.undo.addEventListener('focus', e => {
      e.preventDefault()
      if (e.relatedTarget == this.refs.board) {
        this.refs.board.focus()
      }
    })
    this.refs.undo.addEventListener('click', e => {
      this.undo()
      this.bounce(this.refs.undo)
    })
    this.refs.reset.addEventListener('focus', e => {
      e.preventDefault()
      if (e.relatedTarget == this.refs.board) {
        this.refs.board.focus()
      }
    })
    this.refs.reset.addEventListener('click', e => {
      this.reset()
      this.bounce(this.refs.reset)
    })

    this.refs.autoSolve.addEventListener('change', e => this.updateDisplay())
    this.refs.solveButton.addEventListener('click', e => this.solve())

    this.refs.importButton.addEventListener('click', e => this.import())

    this.history = []
  }

  update () {
    this.refs.name.textContent = this.props.data.name

    this.refs.optimalMoves.textContent = `${this.props.data.optimalMoves}`

    this.refs.board.style.width = `${this.props.data.width * this.props.scale}px`
    this.refs.board.style.height = `${this.props.data.height * this.props.scale}px`

    this.refs.board.innerHTML = ''

    for (let x = 0; x < this.props.data.width; ++x) {
      for (let y = 0; y < this.props.data.height; ++y) {
        let tile = this.tile(x, y)
        if (tile !== ' ') {
          let div = document.createElement('div')

          div.classList.add('tile')
          div.style.width = `${this.props.scale}px`
          div.style.height = `${this.props.scale}px`
          div.style.left = `${x * this.props.scale}px`
          div.style.bottom = `${y * this.props.scale}px`

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
        scale: this.props.scale,
        height: this.props.data.height,
      })
      this.actors.push(actor)
      this.refs.board.appendChild(actor)
    }

    if (!this.props.solver) {
      this.refs.solver.classList.add('hidden')
    }
    if (!this.props.import) {
      this.refs.import.classList.add('hidden')
    }

    this.refs.importInput.value = JSON.stringify(this.props.data)
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
        if (e.shiftKey) {
          this.reset()
          this.bounce(this.refs.reset)
        } else {
          this.undo()
          this.bounce(this.refs.undo)
        }
        e.preventDefault()
        break
      case 'Escape':
        this.refs.board.blur()
        e.preventDefault()
        break
      case 'Tab':
        if (e.shiftKey) {
          this.refs.board.blur()
          this.refs.reset.focus()
          e.preventDefault()
        }
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
        ...actor.props,
        x: nextPos[i].x,
        y: nextPos[i].y,
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
          ...actor.props,
          x: positions[i].x,
          y: positions[i].y,
        }
      }
    } else {
      for (let i = 0; i < this.actors.length; ++i) {
        let actor = this.actors[i]
        actor.props = {
          ...actor.props,
          x: this.props.data.actors[i].x,
          y: this.props.data.actors[i].y,
        }
      }
    }

    this.updateDisplay()
  }

  bounce (element) {
    if (element.classList.contains('one')) {
      element.classList.remove('one')
      element.classList.add('two')
    } else {
      element.classList.remove('two')
      element.classList.add('one')
    }
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
      this.classList.add('was-solved')
      if (this.history.length == this.props.data.optimalMoves) {
        this.classList.add('was-optimal')
      }
    } else {
      this.classList.remove('solved')
    }

    this.refs.moves.textContent = `${this.history.length}`

    if (this.refs.autoSolve.checked) {
      this.solve()
    }
  }

  solve () {
    let puzzle = ''
    for (let row of this.props.data.tiles) {
      puzzle += row + '\n'
    }
    puzzle += '\n'
    for (let actor of this.actors) {
      puzzle += `${actor.props.color == 'red' ? 'R' : 'B'} ${actor.props.x} ${actor.props.y}\n`
    }

    let start = performance.now()
    let solution = wasm_bindgen.solve(puzzle)
    let end = performance.now()
    this.refs.solveTime.textContent = `${(end - start) / 1000}s`

    let solutionHTML = ''

    solutionHTML += '<ol>'
    for (let move of solution) {
      solutionHTML += '<li>'
      switch (move) {
        case 0:
          solutionHTML += '➡️ Right'
          break
        case 1:
          solutionHTML += '⬆️ Up'
          break
        case 2:
          solutionHTML += '⬅️ Left'
          break
        case 3:
          solutionHTML += '⬇️ Down'
          break
      }
      solutionHTML += '</li>'
    }
    solutionHTML += '</ol>'
    this.refs.solution.innerHTML = solutionHTML
  }

  import () {
    this.history = []

    this.classList.remove('solved')
    this.classList.remove('was-solved')
    this.classList.remove('was-optimal')

    let data = JSON.parse(this.refs.importInput.value)
    this.props = {
      ...this.props,
      data,
    }

    this.updateDisplay()
  }
}
window.customElements.define('anima-puzzle', Puzzle)
