## Alternate Framework Offical Types

- Types for Auth, Search, Commerce, Core, UI, and the Official SDK
- Typescript Support
- Framework Agnostic

# How to use

npm i @meeovi/types

`import type {
  User,
  Session,
  Result,
  LoginInput,
  RegisterInput
} from '@meeovi/types'

export interface AuthAdapter {
  login(input: LoginInput): Promise<Result<Session>>
  register(input: RegisterInput): Promise<Result<Session>>
  logout(): Promise<Result<true>>
  getSession(): Promise<Result<Session>>
  refresh(): Promise<Result<Session>>
  getUser(): Promise<Result<User>>
}`