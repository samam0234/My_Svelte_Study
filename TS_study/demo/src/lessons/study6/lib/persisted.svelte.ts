// localStorage와 동기화되는 반응형 값을 만드는 작은 헬퍼.
// 사용: const theme = persisted('theme', 'light');  theme.value = 'dark'
//
// localStorage는 사생활 보호 모드/차단 환경에서 예외가 날 수 있으므로 항상 try/catch로 감싼다.

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장 실패는 무시: 화면 상태는 그대로 동작한다.
  }
}

// 제네릭 T : persisted<'light' | 'dark'>('theme', 'light') 처럼 저장할 값의 타입을 지정한다.
export function persisted<T>(key: string, initial: T) {
  let value = $state<T>(read(key, initial))

  return {
    get value() {
      return value
    },
    set value(next: T) {
      value = next
      write(key, next)
    },
  }
}

export { read as readStorage, write as writeStorage }
