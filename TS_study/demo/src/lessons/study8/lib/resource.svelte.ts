// 비동기 데이터 상태(data / loading / error)를 한 번에 관리하는 작은 헬퍼.
// React의 useQuery / SWR, Vue의 useFetch 에 해당하는 것을 룬으로 직접 만든 버전이다.
//
// 핵심 아이디어 두 가지
//  1) 새 요청을 보내기 전에 이전 요청을 abort() 한다 → 응답 순서가 뒤바뀌어도 "마지막 요청"만 반영된다.
//  2) AbortError는 오류가 아니라 정상적인 취소이므로 화면에 오류로 보여 주지 않는다.
// catch (e) 의 e는 unknown 이다. 좁히는 방법이 두 가지:
//  - e instanceof Error      : 간단하지만 DOMException 은 실행 환경(브라우저/jsdom/Node)에 따라 Error를 상속하지 않을 수 있다.
//  - 객체의 name 속성 비교   : 환경과 무관하게 동작한다 → 여기서는 이쪽을 쓴다.
function isAbortError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && e.name === 'AbortError'
}

// 제네릭 두 개 : T = 응답 데이터 타입, P = load()에 넘기는 매개변수 타입
export function createResource<T, P = void>(fetcher: (params: P, signal: AbortSignal) => Promise<T>) {
  let data = $state<T | undefined>(undefined)
  let error = $state<Error | null>(null)
  let loading = $state(false)
  let controller: AbortController | null = null

  async function load(params: P) {
    controller?.abort() // 진행 중이던 이전 요청 취소
    const mine = (controller = new AbortController())
    loading = true
    error = null

    try {
      const result = await fetcher(params, mine.signal)
      if (mine === controller) data = result
    } catch (e) {
      if (isAbortError(e)) return // 취소된 요청: 아무것도 하지 않는다
      if (mine === controller) error = e instanceof Error ? e : new Error(String(e))
    } finally {
      // 내가 "최신 요청"일 때만 로딩을 끈다. 오래된 요청이 늦게 끝나도 로딩 표시를 건드리지 않는다.
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
    // 서버 응답과 별개로 화면 데이터를 직접 고칠 수 있게 setter도 열어 둔다 (낙관적 업데이트, 로컬 추가 등)
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
