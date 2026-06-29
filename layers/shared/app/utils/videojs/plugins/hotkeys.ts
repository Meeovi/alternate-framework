export default {
  name: 'hotkeys',

  onReady(player) {
    const el = player.el()

    el.addEventListener('keydown', (e) => {
      if (e.key === ' ') player.paused() ? player.play() : player.pause()
      if (e.key === 'ArrowRight') player.currentTime(player.currentTime() + 5)
      if (e.key === 'ArrowLeft') player.currentTime(player.currentTime() - 5)
    })
  }
}
