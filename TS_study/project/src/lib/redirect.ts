/**
 * 로그인 후 돌아갈 주소(?redirect=...)를 안전하게 검사한다.
 * 앱 안의 경로('/write', '/posts/3')만 허용하고, 그 밖의 값은 홈('/')으로 돌린다.
 * (주소창 값은 누구나 바꿀 수 있으므로 그대로 믿고 이동하면 안 된다)
 */
export function safeRedirect(raw: string | null | undefined): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes(':')) return '/'
  return raw
}
