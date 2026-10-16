/*
 * Habit Tracker — runs in the integrations sandbox.
 * The lists page lends `list.items` (read-only, this list only).
 * Streaks are this user's own data for the plugin:
 *   { streaks: { [itemId]: { count, last: 'YYYY-MM-DD' } } }
 */
(async function () {
  'use strict'

  var list = document.getElementById('list')
  var status = document.getElementById('status')

  var day = function (offset) {
    var d = new Date()
    d.setDate(d.getDate() + (offset || 0))
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }

  await MeeoviSandbox.ready
  var items = []
  var data = {}
  try {
    var loaded = await Promise.all([MeeoviSandbox.call('list.items'), MeeoviSandbox.data.get()])
    items = Array.isArray(loaded[0]) ? loaded[0] : []
    data = loaded[1]
  } catch (error) {
    status.textContent = 'Your habits could not be loaded.'
    return
  }
  var streaks = (data && typeof data.streaks === 'object' && data.streaks) || {}

  // A streak only counts while it's unbroken (done today or yesterday).
  function current(id) {
    var s = streaks[id]
    if (!s) return { count: 0, today: false }
    if (s.last === day(0)) return { count: s.count, today: true }
    if (s.last === day(-1)) return { count: s.count, today: false }
    return { count: 0, today: false }
  }

  function render() {
    list.textContent = ''
    status.hidden = items.length > 0
    status.textContent = items.length ? '' : 'Add items to this list to track them as habits.'
    items.forEach(function (item) {
      var state = current(item.id)

      var row = document.createElement('li')
      row.className = 'habit'

      var name = document.createElement('span')
      name.className = 'habit__name'
      name.textContent = String(item.title || 'Untitled')

      var streak = document.createElement('span')
      streak.className = 'habit__streak'
      streak.textContent = state.count + (state.count === 1 ? ' day' : ' days')

      var button = document.createElement('button')
      button.type = 'button'
      button.className = 'habit__done'
      button.textContent = state.today ? 'Done' : 'Done today'
      button.disabled = state.today
      button.addEventListener('click', function () { markDone(item, button) })

      row.append(name, streak, button)
      list.append(row)
    })
  }

  async function markDone(item, button) {
    var state = current(item.id)
    if (state.today) return
    button.disabled = true
    var next = Object.assign({}, streaks)
    next[item.id] = { count: state.count + 1, last: day(0) }
    try {
      var saved = await MeeoviSandbox.data.update({ streaks: next })
      streaks = saved.streaks || next
      render()
    } catch (error) {
      button.disabled = false
      MeeoviSandbox.ui.notify('Could not save. Please try again.')
    }
  }

  render()
})()
