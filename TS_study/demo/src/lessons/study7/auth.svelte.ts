// 로그인 여부를 가진 아주 작은 공유 상태 (study6의 모듈 상태 패턴).
// 라우트 가드(접근 제한)가 이 값을 보고 "/admin"을 열어 줄지 결정한다.
export const auth = $state<{ user: string | null }>({ user: null })

export function login(name: string) {
  auth.user = name.trim() || '손님'
}

export function logout() {
  auth.user = null
}
