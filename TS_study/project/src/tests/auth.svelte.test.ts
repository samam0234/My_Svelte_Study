import { describe, it, expect, vi } from 'vitest'

// auth는 "모듈이 처음 불러와질 때" localStorage를 읽는 싱글톤이다.
// "새로고침 후 앱이 다시 시작되는 상황"을 흉내 내려면 모듈 캐시를 비우고 다시 import한다.
async function freshAuth() {
  vi.resetModules()
  const { config } = await import('../lib/api.js')
  config.latency = 0
  return (await import('../lib/auth.svelte.js')).auth
}

describe('auth 스토어', () => {
  it('처음에는 로그아웃 상태', async () => {
    const auth = await freshAuth()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('로그인하면 사용자 정보가 채워지고 저장된다', async () => {
    const auth = await freshAuth()
    await auth.login('hong', '1234')

    expect(auth.user).toEqual({ username: 'hong', name: '홍길동' })
    expect(auth.isLoggedIn).toBe(true)
    expect(JSON.parse(localStorage.getItem('board-user') ?? 'null')).toEqual({ username: 'hong', name: '홍길동' })
  })

  it('실패하면 오류를 던지고 상태는 그대로', async () => {
    const auth = await freshAuth()
    await expect(auth.login('hong', 'wrong')).rejects.toMatchObject({ status: 401 })
    expect(auth.isLoggedIn).toBe(false)
    expect(localStorage.getItem('board-user')).toBeNull()
  })

  it('새로고침(모듈 재로딩)해도 로그인이 유지되고, 로그아웃하면 지워진다', async () => {
    const first = await freshAuth()
    await first.login('kim', '1234')

    const afterReload = await freshAuth()
    expect(afterReload.user?.username).toBe('kim')

    afterReload.logout()
    expect(afterReload.isLoggedIn).toBe(false)
    expect(localStorage.getItem('board-user')).toBeNull()
  })
})
