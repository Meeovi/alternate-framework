export type RCResponse<T> = { success: boolean; data?: T; result?: T }

export class RocketChatClient {
  baseUrl: string
  token?: string
  userId?: string

  constructor(baseUrl: string, token?: string, userId?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.token = token
    this.userId = userId
  }

  private headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) {
      h['X-Auth-Token'] = this.token
    }
    if (this.userId) {
      h['X-User-Id'] = this.userId
    }
    return h
  }

  async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}/api/v1/${path.replace(/^\//, '')}`
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
    const json = await res.json()
    return (json.data ?? json.result ?? json) as T
  }

  // Simple login helper (returns auth token + userId)
  async login(username: string, password: string) {
    const res = await this.request<any>('POST', '/login', { user: username, password })
    // Rocket.Chat returns data: { userId, authToken }
    return res
  }
}
