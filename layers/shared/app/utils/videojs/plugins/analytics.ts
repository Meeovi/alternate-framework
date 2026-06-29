export default {
  name: 'analytics',

  onEvent(event, data) {
    window.dispatchEvent(
      new CustomEvent(`videojs-analytics:${event}`, { detail: data })
    )
  }
}
