import { getRegistry } from './index'

export const auth = {
  login: (input: { email: string; password: string }) => getRegistry().auth?.login(input),
  register: (input: { email: string; password: string; confirmPassword: string }) => getRegistry().auth?.register(input),
  logout: () => getRegistry().auth?.logout(),
  getSession: () => getRegistry().auth?.getSession(),
  refresh: () => getRegistry().auth?.refresh(),
  getUser: () => getRegistry().auth?.getUser()
}