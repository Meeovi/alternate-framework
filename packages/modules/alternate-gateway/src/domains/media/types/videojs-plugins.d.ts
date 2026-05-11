declare module 'video.js' {
  interface Player {
    qualityLevels?: () => any;
    hlsQualitySelector?: (options?: any) => any;
    vr?: (options?: any) => any;
    share?: (options?: any) => any;
    ads?: () => any;
    wavesurfer?: (options?: any) => any;
    persist?: () => any;
    currentType?: () => string;
  }
}

declare module 'videojs-hls-quality-selector';
declare module 'videojs-persist';
declare module 'videojs-share';

declare module 'video.js/dist/types/player' {
  interface Player {
    qualityLevels?: () => any;
    hlsQualitySelector?: (options?: any) => any;
    vr?: (options?: any) => any;
    share?: (options?: any) => any;
    ads?: () => any;
    wavesurfer?: (options?: any) => any;
    persist?: () => any;
    currentType?: () => string;
  }
}
