// svelte/store : Svelte 3/4 시절부터 있던 "스토어". Svelte 5에서도 그대로 동작한다.
// 일반 .js 파일이라 룬을 쓸 수 없고, 구독(subscribe) 기반으로 값을 전달한다.
// 컴포넌트에서는 이름 앞에 $ 를 붙이면 자동 구독/해제된다 ($messages).
import { writable, derived } from 'svelte/store'

export interface Message {
  id: number
  text: string
}

export const messages = writable<Message[]>([])

// 다른 스토어에서 계산되는 스토어
export const messageCount = derived(messages, ($messages) => $messages.length)

let nextId = 1

export function notify(text: string) {
  messages.update((list) => [...list, { id: nextId++, text }])
}

export function dismiss(id: number) {
  messages.update((list) => list.filter((m) => m.id !== id))
}

export function clearMessages() {
  messages.set([])
}
