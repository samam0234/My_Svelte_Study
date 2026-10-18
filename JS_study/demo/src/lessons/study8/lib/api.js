// JSONPlaceholder : 연습용 공개 REST API (https://jsonplaceholder.typicode.com)
//  - GET은 진짜 데이터를 돌려준다.
//  - POST / PUT / DELETE는 "성공한 것처럼" 응답만 주고 실제로 저장하지는 않는다.
//    → 그래서 이 실습에서는 서버 응답을 받은 뒤 화면 상태를 직접 갱신한다.
const BASE = 'https://jsonplaceholder.typicode.com'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// fetch는 404, 500 같은 HTTP 오류에서도 reject하지 않는다 (네트워크가 끊겼을 때만 reject).
// 그래서 res.ok를 직접 확인해서 오류로 바꿔 주는 공통 함수를 만든다.
async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(BASE + path, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new ApiError(res.status, `요청에 실패했습니다 (HTTP ${res.status})`)
  return res.json()
}

// 오류 처리를 연습하려고 일부러 존재하지 않는 주소로 보내는 용도 (404)
const FAIL_PATH = '/__not_found__'

export function listPosts({ userId, limit = 5, signal, fail = false } = {}) {
  if (fail) return request(FAIL_PATH, { signal })
  const query = new URLSearchParams({ _limit: String(limit) })
  if (userId) query.set('userId', String(userId))
  return request(`/posts?${query}`, { signal })
}

export function getPost(id, { signal } = {}) {
  return request(`/posts/${id}`, { signal })
}

export function createPost(data, { fail = false } = {}) {
  return request(fail ? FAIL_PATH : '/posts', { method: 'POST', body: data })
}

export function deletePost(id, { fail = false } = {}) {
  return request(fail ? FAIL_PATH : `/posts/${id}`, { method: 'DELETE' })
}
