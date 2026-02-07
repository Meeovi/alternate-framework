import type {
  User,
  Session,
  Result,
  LoginInput,
  RegisterInput
} from '@mframework/core'

export interface AuthAdapter {
  login(input: LoginInput): Promise<Result<Session>>
  register(input: RegisterInput): Promise<Result<Session>>
  logout(): Promise<Result<true>>
  getSession(): Promise<Result<Session>>
  refresh(): Promise<Result<Session>>
  getUser(): Promise<Result<User>>
}