// 테스트용 가짜 서버. 실제 네트워크를 쓰지 않고 fetch를 대신한다.
// (진짜 서버에 의존하는 테스트는 느리고, 인터넷이 없으면 실패하고, 결과가 매번 달라질 수 있다.)
import { vi } from 'vitest'

/** 가짜 서버가 받은 요청 기록 */
export interface RecordedCall {
  method: string
  path: string
  body?: BodyInit | null
}

interface FakeFetchOptions {
  /** 모든 응답을 지연시킬 시간(ms) */
  delay?: number
}

/**
 * globalThis.fetch 를 가짜로 바꾼다.
 * @returns 호출 기록. 테스트에서 "POST가 몇 번 나갔는가"를 확인할 때 쓴다.
 */
export function installFakeFetch({ delay = 0 }: FakeFetchOptions = {}): RecordedCall[] {
  const calls: RecordedCall[] = []

  const json = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data })

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string | URL, options: RequestInit = {}) => {
      const u = new URL(url)
      const method = options.method ?? 'GET'
      calls.push({ method, path: u.pathname + u.search, body: options.body })

      // 지연 + AbortSignal 지원 (abort되면 실제 fetch처럼 AbortError로 reject)
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delay)
        options.signal?.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
      })

      if (u.pathname === '/__not_found__') return json({}, 404)

      const one = u.pathname.match(/^\/posts\/(\d+)$/)
      if (one) {
        const id = Number(one[1])
        if (method === 'DELETE') return json({})
        return id <= 100 ? json({ id, userId: 1, title: `title ${id}`, body: `body ${id}` }) : json({}, 404)
      }

      if (u.pathname === '/posts' && method === 'POST') {
        return json({ ...JSON.parse(String(options.body)), id: 101 }, 201)
      }

      if (u.pathname === '/posts') {
        const limit = Number(u.searchParams.get('_limit') ?? 5)
        const userId = Number(u.searchParams.get('userId') ?? 1)
        return json(
          Array.from({ length: limit }, (_, i) => ({ id: i + 1, userId, title: `post ${i + 1}`, body: 'body' })),
        )
      }

      return json({}, 404)
    }),
  )

  return calls
}
