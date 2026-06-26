export { useSnackbar } from '@mframework/alternate-auth'

// Re-export for backward compatibility  
export const useToast = () => {
  const snackbar = useSnackbar()
  return {
    add: (opts: { title?: string; description: string; color?: string; timeout?: number }) => {
      snackbar.show({
        message: opts.title ? `${opts.title}: ${opts.description}` : opts.description,
        color: opts.color,
        timeout: opts.timeout,
      })
    },
  }
}