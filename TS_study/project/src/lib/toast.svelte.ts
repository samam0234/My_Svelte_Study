import { untrack } from 'svelte'

export type ToastType = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

// 화면 구석에 잠깐 떴다 사라지는 알림. 어느 컴포넌트에서든 notify('...')만 호출하면 된다.
export const toasts = $state<Toast[]>([])

let nextId = 1

export function notify(message: string, type: ToastType = 'info', duration = 2500): number {
  const id = nextId++
  // untrack : 컴포넌트가 만들어지는 도중에 호출돼도 "읽기"가 추적되어 재실행되지 않게 한다 (study9)
  untrack(() => toasts.push({ id, message, type }))
  setTimeout(() => dismiss(id), duration)
  return id
}

export function dismiss(id: number): void {
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) toasts.splice(index, 1)
}
