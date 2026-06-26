export function useGravatar(email: string, size: number = 80): string {
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}

export function useGravatarUrl(email: string, size: number = 80): string {
  return useGravatar(email, size)
}

function md5(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16).padStart(32, '0').replace(/(.{4})(?=.{4})?/g, '$1')
}