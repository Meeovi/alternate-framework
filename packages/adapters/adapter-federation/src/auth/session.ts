import { Client } from '@atproto/lex'
import type { PasswordSession } from '@atproto/lex-password-session'

export function createAtprotoClient(session: PasswordSession): Client {
	return new Client(session)
}
