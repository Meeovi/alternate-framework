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
