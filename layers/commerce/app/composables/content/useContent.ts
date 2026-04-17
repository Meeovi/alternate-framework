import useContentAdapter from './useContentAdapter'
import useContentRequest from './useContentRequest'

export function useContentFallback() {
  const content = useContentAdapter()
  const request = useContentRequest()

  return {
    adapter: content,
    ...request,
    ...content,
  }
}

export default useContentFallback
