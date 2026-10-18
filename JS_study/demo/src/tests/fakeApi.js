// 테스트용 가짜 서버. 실제 네트워크를 쓰지 않고 fetch를 대신한다.
// (진짜 서버에 의존하는 테스트는 느리고, 인터넷이 없으면 실패하고, 결과가 매번 달라질 수 있다.)
import { vi } from 'vitest'

/**
 * globalThis.fetch 를 가짜로 바꾼다.
 * @param {{ delay?: number }} [options] delay: 모든 응답을 지연시킬 시간(ms)
 * @returns 호출 기록 { method, path, body }[]
 */
export function installFakeFetch({ delay = 0 } = {}) {
  const calls = []

  const json = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options = {}) => {
      const u = new URL(url)
      const method = options.method ?? 'GET'
      calls.push({ method, path: u.pathname + u.search, body: options.body })

      // 지연 + AbortSignal 지원 (abort되면 실제 fetch처럼 AbortError로 reject)
      await new Promise((resolve, reject) => {
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
        return json({ ...JSON.parse(options.body), id: 101 }, 201)
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
