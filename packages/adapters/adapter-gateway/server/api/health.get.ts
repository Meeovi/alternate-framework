import { getMesh } from '../mesh/runtime'

export default defineEventHandler(async (event) => {
  await getMesh()
  return {
    status: 'ok'
  }
})
