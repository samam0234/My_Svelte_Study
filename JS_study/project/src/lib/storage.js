// localStorage 읽기/쓰기. 사생활 보호 모드·용량 초과 등으로 예외가 날 수 있으므로 항상 try/catch (study6)
export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장 실패는 무시: 화면 상태는 그대로 동작한다.
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 무시
  }
}
