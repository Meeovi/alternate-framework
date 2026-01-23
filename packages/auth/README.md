
---

# 📦 `@meeovi/auth` — README.md

```md
# @meeovi/auth

A unified authentication abstraction for Meeovi.  
Supports Better Auth, Auth.js, Lucia, Ory, and custom auth backends.

## ✨ Features

- Unified `useAuth()` composable  
- Pluggable auth providers  
- Runtime configuration  
- Session helpers  

## 📦 Installation

```sh
npm install @meeovi/auth

⚙️ Configuration

import { setAuthConfig } from '@meeovi/auth'

setAuthConfig({
  authProvider: 'better-auth',
  authUrl: '/api/auth'
})
🧩 Usage

import { useAuth } from '@meeovi/auth'

const { login, logout, session } = useAuth()

await login({ email, password })
🔌 Providers

export interface AuthProvider {
  login(credentials: any): Promise<any>
  logout(): Promise<void>
  session(): Promise<any>
}
Register:


registerAuthProvider('better-auth', { login, logout, session })
🧱 Folder Structure
Code
src/
  providers/
  config.
  registry.
  useAuth.