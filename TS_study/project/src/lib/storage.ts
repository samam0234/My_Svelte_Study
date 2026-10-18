// localStorage 읽기/쓰기. 사생활 보호 모드·용량 초과 등으로 예외가 날 수 있으므로 항상 try/catch (study6)
// 제네릭 T : readJson<User | null>('key', null) 처럼 저장된 값의 타입을 호출하는 쪽이 정한다.
// (JSON.parse는 런타임에 타입을 검증하지 않으므로, 외부 입력이 중요하면 스키마 검증을 추가한다 — study8)
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장 실패는 무시: 화면 상태는 그대로 동작한다.
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // 무시
  }
}
