import { describe, it, expect } from 'vitest'
import { createResource } from '../lessons/study8/lib/resource.svelte.js'

// 테스트에서 "응답이 언제 도착하는지"를 직접 정하기 위한 도구 : 외부에서 resolve/reject 하는 Promise
function deferred<T = unknown>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('createResource', () => {
  it('성공하면 data가 채워지고 loading이 꺼진다', async () => {
    const r = createResource(async (n: number) => n * 2)
    const done = r.load(21)
    expect(r.loading).toBe(true)

    await done
    expect(r.data).toBe(42)
    expect(r.loading).toBe(false)
    expect(r.error).toBeNull()
  })

  it('실패하면 error에 담기고 loading이 꺼진다', async () => {
    const r = createResource(async () => {
      throw new Error('서버 오류')
    })
    await r.load()
    expect(r.error?.message).toBe('서버 오류')
    expect(r.data).toBeUndefined()
    expect(r.loading).toBe(false)
  })

  it('새 요청을 보내면 이전 요청을 abort하고, 늦게 도착한 옛 응답은 무시한다', async () => {
    const slow = deferred<string>()
    const fast = deferred<string>()
    const signals: AbortSignal[] = []
    const r = createResource((which: 'slow' | 'fast', signal) => {
      signals.push(signal)
      return which === 'slow' ? slow.promise : fast.promise
    })

    const first = r.load('slow')
    const second = r.load('fast')
    expect(signals[0].aborted).toBe(true) // 첫 요청은 취소됨
    expect(signals[1].aborted).toBe(false)

    fast.resolve('빠른 응답')
    await second
    expect(r.data).toBe('빠른 응답')
    expect(r.loading).toBe(false)

    slow.resolve('늦게 도착한 옛 응답') // 취소된 요청이 뒤늦게 끝나도
    await first
    expect(r.data).toBe('빠른 응답') // 덮어쓰지 못한다
  })

  it('AbortError는 오류로 취급하지 않는다', async () => {
    const d = deferred<string>()
    const r = createResource(() => d.promise)
    const done = r.load()
    d.reject(new DOMException('aborted', 'AbortError'))
    await done
    expect(r.error).toBeNull()
  })

  it('abort()는 진행 중 요청을 취소하고 loading을 끈다', async () => {
    const d = deferred<string>()
    let signal: AbortSignal | undefined
    const r = createResource((_: void, s) => {
      signal = s
      return d.promise
    })
    r.load()
    expect(r.loading).toBe(true)
    r.abort()
    expect(signal?.aborted).toBe(true)
    expect(r.loading).toBe(false)
  })

  it('data를 직접 바꿀 수 있다 (낙관적 업데이트용)', async () => {
    const r = createResource(async () => [1, 2, 3])
    await r.load()
    r.data = r.data?.filter((n) => n !== 2)
    expect(r.data).toEqual([1, 3])
  })
})
