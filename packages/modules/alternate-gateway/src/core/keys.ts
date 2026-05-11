import type { InjectionKey } from 'vue'
import type { GatewayContract } from '../contracts/gateway'
import type { AuthContract } from '../contracts/auth'
import type { User } from '../contracts/user'

export const GatewayKey: InjectionKey<GatewayContract> = Symbol('MFrameworkGateway')
export const AuthKey: InjectionKey<AuthContract> = Symbol('MFrameworkAuth')
export const CurrentUserKey: InjectionKey<User | null> = Symbol('MFrameworkCurrentUser')
