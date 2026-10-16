/*
 * Kanban board — runs in the integrations sandbox.
 * The lists page lends: list.items, list.create, list.update, list.remove
 * (all scoped to the list on screen). Card status is list_items.status.
 */
(async function () {
  'use strict'

  var COLUMNS = [
    { id: 'todo', label: 'To Do' },
    { id: 'doing', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ]
  var PRIORITIES = [
    { value: 0, label: 'No priority' },
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
  ]

  var board = document.getElementById('board')
  var status = document.getElementById('status')
  var items = []
  var editing = null
  var dragged = null
  var busy = false

  await MeeoviSandbox.ready

  function el(tag, className, text) {
    var node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
  }

  function button(label, className, onClick, title) {
    var b = el('button', 'button' + (className ? ' ' + className : ''), label)
    b.type = 'button'
    if (title) b.title = title
    b.setAttribute('aria-label', title || label)
    b.addEventListener('click', onClick)
    return b
  }

  async function act(method, params) {
    if (busy) return
    busy = true
    try {
      items = await MeeoviSandbox.call(method, params)
      editing = null
      render()
    } catch (error) {
      MeeoviSandbox.ui.notify('Could not save the board. Please try again.')
    } finally {
      busy = false
    }
  }

  function inColumn(id) {
    return items
      .filter(function (i) { return (i.status || 'todo') === id })
      .sort(function (a, b) { return (a.position || 0) - (b.position || 0) })
  }

  function move(item, columnId) {
    if ((item.status || 'todo') === columnId) return
    act('list.update', { id: item.id, changes: { status: columnId, position: inColumn(columnId).length } })
  }

  function cardView(item, columnIndex) {
    var card = el('article', 'card')
    if (item.priority === 3) card.classList.add('card--high')
    if (item.priority === 1) card.classList.add('card--low')
    card.draggable = true
    card.tabIndex = 0
    card.addEventListener('dragstart', function (e) {
      dragged = item
      card.classList.add('card--dragging')
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(item.id))
    })
    card.addEventListener('dragend', function () {
      dragged = null
      card.classList.remove('card--dragging')
    })

    if (editing === item.id) {
      card.draggable = false
      card.append(editor(item))
      return card
    }

    card.append(el('p', 'card__title', item.title || 'Untitled'))
    var meta = []
    var priority = PRIORITIES.find(function (p) { return p.value === item.priority })
    if (priority && priority.value) meta.push(priority.label)
    if (item.due_date) meta.push('Due ' + new Date(item.due_date).toLocaleDateString())
    if (meta.length) card.append(el('div', 'card__meta', meta.join(' · ')))

    var actions = el('div', 'card__actions')
    if (columnIndex > 0) actions.append(button('←', '', function () { move(item, COLUMNS[columnIndex - 1].id) }, 'Move to ' + COLUMNS[columnIndex - 1].label))
    if (columnIndex < COLUMNS.length - 1) actions.append(button('→', '', function () { move(item, COLUMNS[columnIndex + 1].id) }, 'Move to ' + COLUMNS[columnIndex + 1].label))
    actions.append(button('Edit', '', function () { editing = item.id; render() }))
    card.append(actions)
    return card
  }

  function editor(item) {
    var box = el('div', 'editor')
    var title = el('input', 'field')
    title.value = item.title || ''
    title.setAttribute('aria-label', 'Title')
    var description = el('textarea', 'field')
    description.rows = 3
    description.value = item.description || ''
    description.setAttribute('aria-label', 'Description')
    var priority = el('select', 'field')
    priority.setAttribute('aria-label', 'Priority')
    PRIORITIES.forEach(function (p) {
      var option = el('option', '', p.label)
      option.value = String(p.value)
      option.selected = (item.priority || 0) === p.value
      priority.append(option)
    })
    var due = el('input', 'field')
    due.type = 'date'
    due.setAttribute('aria-label', 'Due date')
    if (item.due_date) due.value = String(item.due_date).slice(0, 10)

    var actions = el('div', 'card__actions')
    actions.append(
      button('Save', 'button--primary', function () {
        act('list.update', {
          id: item.id,
          changes: {
            title: title.value.trim() || 'Untitled',
            description: description.value.trim() || null,
            priority: Number(priority.value),
            due_date: due.value || null,
          },
        })
      }),
      button('Cancel', '', function () { editing = null; render() }),
      button('Delete', 'button--danger', function () { act('list.remove', { id: item.id }) }),
    )
    box.append(title, description, priority, due, actions)
    setTimeout(function () { title.focus() })
    return box
  }

  function columnView(column, index) {
    var col = el('section', 'column')
    col.setAttribute('aria-label', column.label)
    var cards = inColumn(column.id)
    var head = el('div', 'column__head', column.label)
    head.append(el('span', 'column__count', String(cards.length)))
    col.append(head)
    cards.forEach(function (item) { col.append(cardView(item, index)) })

    col.addEventListener('dragover', function (e) {
      if (!dragged) return
      e.preventDefault()
      col.classList.add('column--over')
    })
    col.addEventListener('dragleave', function () { col.classList.remove('column--over') })
    col.addEventListener('drop', function (e) {
      e.preventDefault()
      col.classList.remove('column--over')
      if (dragged) move(dragged, column.id)
    })

    var add = el('div', 'add')
    var input = el('input', 'field')
    input.placeholder = 'Add a card'
    input.setAttribute('aria-label', 'New card in ' + column.label)
    var create = function () {
      var text = input.value.trim()
      if (!text) return
      act('list.create', { title: text, status: column.id, position: cards.length, priority: 0 })
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') create() })
    add.append(input, button('Add', '', create))
    col.append(add)
    return col
  }

  function render() {
    board.textContent = ''
    COLUMNS.forEach(function (column, index) { board.append(columnView(column, index)) })
  }

  try {
    items = await MeeoviSandbox.call('list.items')
  } catch (error) {
    status.textContent = 'This board could not be loaded.'
    return
  }
  status.hidden = true
  board.hidden = false
  render()
})()
