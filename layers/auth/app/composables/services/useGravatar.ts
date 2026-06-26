const { proxy } = useScriptGravatar()

export function useGravatar(email: string, size: number = 80): string {
  const hash = proxy.md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}

export function useGravatarUrl(email: string, size: number = 80): string {
  return useGravatar(email, size)
}