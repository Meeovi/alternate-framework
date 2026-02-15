import iziToast from 'izitoast'
import 'izitoast/dist/css/iziToast.min.css'

export const useMToast = () => {
  const success = (message: string, title = 'Success') => {
    iziToast.success({ title, message })
  }

  const error = (message: string, title = 'Error') => {
    iziToast.error({ title, message })
  }

  return { success, error }
}