// study8의 createResource : 비동기 데이터의 data / loading / error 를 한 번에 관리한다.
//  - 새 요청을 보내면 이전 요청을 abort 한다 → 응답 순서가 뒤바뀌어도 마지막 요청만 반영된다.
//  - AbortError는 오류가 아니라 정상적인 취소이므로 화면에 보이지 않는다.
export function createResource(fetcher) {
  let data = $state(undefined)
  let error = $state(null)
  let loading = $state(false)
  let controller = null

  async function load(params) {
    controller?.abort()
    const mine = (controller = new AbortController())
    loading = true
    error = null

    try {
      const result = await fetcher(params, mine.signal)
      if (mine === controller) data = result
    } catch (e) {
      if (e?.name === 'AbortError') return
      if (mine === controller) error = e
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
    set data(next) {
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
