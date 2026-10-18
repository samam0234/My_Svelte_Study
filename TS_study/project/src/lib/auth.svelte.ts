import * as api from './api.js'
import type { User } from './api.js'
import { readJson, writeJson, removeKey } from './storage.js'

const USER_KEY = 'board-user'

// 로그인 상태를 가진 공유 스토어 (study6의 "클래스 + 룬" 패턴)
class AuthStore {
  // 새로고침해도 로그인이 유지되도록 localStorage에서 복원
  user = $state<User | null>(readJson<User | null>(USER_KEY, null))

  isLoggedIn = $derived(this.user !== null)

  async login(username: string, password: string): Promise<void> {
    this.user = await api.login(username, password) // 실패하면 ApiError가 그대로 던져진다
    writeJson(USER_KEY, this.user)
  }

  logout(): void {
    this.user = null
    removeKey(USER_KEY)
  }
}

export const auth = new AuthStore()
