export type VideojsPlayer = {
  qualityLevels?: () => any;
  hlsQualitySelector?: (options?: any) => any;
  vr?: (options?: any) => any;
  share?: (options?: any) => any;
  ads?: () => any;
  wavesurfer?: (options?: any) => any;
  persist?: () => any;
  currentType?: () => string;
  [key: string]: any;
};
