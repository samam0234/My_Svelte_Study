// study8의 createResource : 비동기 데이터의 data / loading / error 를 한 번에 관리한다.
//  - 새 요청을 보내면 이전 요청을 abort 한다 → 응답 순서가 뒤바뀌어도 마지막 요청만 반영된다.
//  - AbortError는 오류가 아니라 정상적인 취소이므로 화면에 보이지 않는다.
// catch (e)의 e는 unknown. instanceof Error는 환경(jsdom 등)에 따라 DOMException에서 false일 수 있어 name으로 판별한다 (study8)
function isAbortError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && e.name === 'AbortError'
}

// 제네릭: T = 응답 데이터 타입, P = load()의 매개변수 타입
export function createResource<T, P = void>(fetcher: (params: P, signal: AbortSignal) => Promise<T>) {
  let data = $state<T | undefined>(undefined)
  let error = $state<Error | null>(null)
  let loading = $state(false)
  let controller: AbortController | null = null

  async function load(params: P) {
    controller?.abort()
    const mine = (controller = new AbortController())
    loading = true
    error = null

    try {
      const result = await fetcher(params, mine.signal)
      if (mine === controller) data = result
    } catch (e) {
      if (isAbortError(e)) return
      if (mine === controller) error = e instanceof Error ? e : new Error(String(e))
    } finally {
      if (mine === controller) loading = false
    }
  }

  function abort() {
    controller?.abort()
    controller = null
    loading = false
  }

  return {
    get data() {
      return data
    },
    set data(next: T | undefined) {
      data = next
    },
    get error() {
      return error
    },
    get loading() {
      return loading
    },
    load,
    abort,
  }
}
