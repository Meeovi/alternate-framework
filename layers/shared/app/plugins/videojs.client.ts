import '@videojs/html/video/player';
import '@videojs/html/video/skin';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.provide('videojs', {
    createPlayer: (element: HTMLVideoElement, options: any) => {
      const player = new window.videojs.Player(element, options);
      return player;
    },
    dispose: (player: any) => {
      if (player && typeof player.dispose === 'function') {
        player.dispose();
      }
    }
  });
});