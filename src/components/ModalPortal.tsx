import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function ModalPortal({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.getElementById('root')
    root?.classList.add('modal-blur')
    return () => root?.classList.remove('modal-blur')
  }, [])

  return createPortal(children, document.body)
}
