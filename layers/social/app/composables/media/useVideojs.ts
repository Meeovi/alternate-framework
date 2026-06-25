export default function useVideojs() {
  
  return {
    createPlayer: () => ({ play: () => {}, pause: () => {} }),
    dispose: () => {}
  }
}
