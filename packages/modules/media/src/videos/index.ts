import videojs from 'video.js';
import type { VideojsPlayer as VjsPlayer } from './videojs-types';
import 'video.js/dist/video-js.css';

// Import the plugins
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';
import 'videojs-share';
import 'videojs-vr';
import 'videojs-wavesurfer';
import 'videojs-contrib-ads';
import 'videojs-persist';

// Import plugin CSS
import 'videojs-share/dist/videojs-share.css';

export function initializeVideoPlayer(elementId: string | HTMLElement, options: Record<string, any> = {}): VjsPlayer {
  const player = (videojs as unknown as (id: string | Element, options?: any) => VjsPlayer)(elementId, {
    html5: {
      vhs: {
        overrideNative: true
      }
    },
    ...options
  });

  // Initialize plugins
  (player as VjsPlayer).qualityLevels?.();
  (player as VjsPlayer).hlsQualitySelector?.({ displayCurrentQuality: true });

  // VR plugin
  if (options.vr) {
    (player as VjsPlayer).vr?.({ projection: '360' });
  }

  // Share plugin
  (player as VjsPlayer).share?.({
    socials: ['fb', 'tw', 'reddit', 'gp', 'messenger', 'linkedin', 'telegram', 'whatsapp', 'viber', 'vk', 'ok', 'mail'],
    url: window.location.href,
    title: 'Video Share',
    description: 'Check out this video',
    image: 'https://dummyimage.com/1200x630',
    fbAppId: '12345',
    redirectUri: window.location.href + '#close'
  });

  // Ads plugin
  if (options.ads) {
    (player as VjsPlayer).ads?.();
    // You need to set up your ad integration here
    // For example, with IMA:
    // player.ima(your_ima_options);
  }

  // Wavesurfer plugin (for audio)
  if (typeof player.currentType === 'function' && player.currentType() === 'audio') {
    (player as VjsPlayer).wavesurfer?.({
      src: 'path/to/audio/file.mp3',
      msDisplayMax: 10,
      debug: true,
      waveColor: 'grey',
      progressColor: 'black',
      cursorColor: 'black',
      hideScrollbar: true
    });
  }

  // Persist plugin
  (player as VjsPlayer).persist?.();

  return player;
}
