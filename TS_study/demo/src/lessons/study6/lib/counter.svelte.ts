// 파일 이름이 .svelte.js 이기 때문에 이 파일 안에서도 룬($state, $derived ...)을 쓸 수 있다.

// ── 방법 1) 모듈 스코프 상태 (싱글톤) ───────────────────────────────
// 이 파일을 import한 모든 컴포넌트가 같은 객체를 본다.
// 반드시 "객체"로 만들고 속성을 바꾼다 (counter.count++).
//
//   ❌ export let count = $state(0)  →  count++ 처럼 재할당하는 순간 컴파일 에러 (state_invalid_export)
//      import한 쪽은 "값의 복사본"만 받을 수 있어서 반응형을 유지할 수 없기 때문이다.
export const counter = $state({ count: 0 })

export function increment() {
  counter.count++
}

export function reset() {
  counter.count = 0
}

// ── 방법 2) 팩토리 함수 ─────────────────────────────────────────────
// 호출할 때마다 독립된 상태를 만든다. 반응형 값은 getter로 노출한다.
// (getter를 쓰는 이유: 반환할 때 값을 복사해 버리면 반응성을 잃기 때문)
export function createCounter(initial: number = 0) {
  let count = $state(initial)
  const double = $derived(count * 2)

  return {
    get count() {
      return count
    },
    get double() {
      return double
    },
    increment() {
      count++
    },
    reset() {
      count = initial
    },
  }
}
