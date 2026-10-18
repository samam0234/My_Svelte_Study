import { untrack } from 'svelte'

// 생명주기 실행 순서를 화면에 기록하기 위한 공유 로그
export const logs = $state([])

// untrack : 컴포넌트가 만들어지는 중에 로그를 쓰면 "이 컴포넌트가 logs를 읽었다"고 추적되어
// 로그가 추가될 때마다 컴포넌트가 다시 만들어지는 무한 반복이 될 수 있다. 추적하지 않고 기록만 한다.
export function log(message) {
  untrack(() => logs.push(message))
}

export function clearLogs() {
  logs.length = 0
}
