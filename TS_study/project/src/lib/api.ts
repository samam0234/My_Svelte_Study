// ── 가짜 백엔드 ────────────────────────────────────────────────────────────
// 실제 서버 대신 localStorage에 게시글을 저장하는 API 계층.
// 중요한 점: 모든 함수가 "fetch처럼" Promise를 돌려주고, 시간이 걸리며, 실패할 수 있다.
// 그래서 화면 코드는 진짜 서버를 붙여도 거의 바뀌지 않는다. (study8)
//   → 나중에 이 파일의 함수 본문만 fetch('/api/...') 로 바꾸면 된다.
import { readJson, writeJson } from './storage.js'

const POSTS_KEY = 'board-posts'

// 시뮬레이션하는 네트워크 지연(ms). 테스트에서는 0으로 줄인다.
export const config = { latency: 150 }

// ── 타입 ──────────────────────────────────────────────────────────────────
/** 로그인한 사용자 (비밀번호는 포함하지 않는다) */
export interface User {
  username: string
  name: string
}

export interface Post {
  id: number
  title: string
  content: string
  author: string // 작성자의 username
  authorName: string
  createdAt: string // ISO 날짜 문자열
  views: number
}

/** 글쓰기/수정 폼이 보내는 값 */
export type PostInput = Pick<Post, 'title' | 'content'>

export interface ListParams {
  q?: string
  page?: number
  pageSize?: number
  signal?: AbortSignal
}

/** 목록 응답: 현재 페이지의 글 + 전체 정보 */
export interface PostPage {
  items: Post[]
  total: number
  page: number
  totalPages: number
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// 데모용 계정 (실제 서비스라면 비밀번호를 프런트에 두면 안 된다!)
interface Account extends User {
  password: string
}

const USERS: Account[] = [
  { username: 'hong', password: '1234', name: '홍길동' },
  { username: 'kim', password: '1234', name: '김철수' },
]

const delay = () => new Promise((resolve) => setTimeout(resolve, config.latency))

// ── 초기 데이터 ───────────────────────────────────────────────────────────
function seedPosts(): Post[] {
  const topics: [title: string, username: string, content: string][] = [
    ['Svelte 5 룬(rune) 정리', 'hong', '$state, $derived, $effect 세 가지만 알면 반응형의 80%는 끝납니다.'],
    ['Vue와 Svelte 비교 후기', 'kim', '템플릿 문법은 비슷한데 반응형 선언 방식이 완전히 달라서 재미있었어요.'],
    ['props 와 콜백 이벤트 연습', 'hong', '자식이 부모에게 알리는 방법은 콜백 prop 하나로 통일됩니다.'],
    ['{#each} 에서 key 가 중요한 이유', 'kim', '입력 중인 폼이 있는 목록은 반드시 key를 지정하세요.'],
    ['snippet 으로 컴포넌트 합성하기', 'hong', 'slot 대신 children 과 snippet 을 쓰는 방식이 처음엔 낯설었습니다.'],
    ['모듈 상태로 장바구니 만들기', 'kim', '.svelte.js 파일에 클래스를 만들고 $state 필드를 쓰면 전역 스토어가 됩니다.'],
    ['해시 라우터 직접 만들어 보기', 'hong', '80줄이면 충분합니다. 가드에서 경쟁 상태가 생기는 부분이 포인트.'],
    ['fetch 와 AbortController', 'kim', '필터를 빠르게 바꿀 때 이전 요청을 취소하지 않으면 옛 응답이 덮어씁니다.'],
    ['transition 과 animate:flip', 'hong', '내장 애니메이션 덕분에 라이브러리 없이도 부드러운 목록을 만들 수 있어요.'],
    ['Vitest 로 컴포넌트 테스트하기', 'kim', '사용자가 보는 방식으로 요소를 찾으면 리팩터링에도 테스트가 안 깨집니다.'],
    ['SvelteKit 은 언제 쓰나요', 'hong', '검색 엔진 노출이나 서버 렌더링이 필요하면 SvelteKit 이 좋은 선택입니다.'],
    ['미니 게시판 만들기 시작!', 'kim', '지금까지 배운 것을 모아서 목록, 상세, 검색, 로그인을 만들어 봅니다.'],
  ]
  const base = new Date('2026-10-01T09:00:00').getTime()
  return topics.map(([title, username, content], i) => ({
    id: i + 1,
    title,
    content,
    author: username,
    authorName: USERS.find((u) => u.username === username)?.name ?? username,
    createdAt: new Date(base + i * 36e5 * 20).toISOString(),
    views: (i * 7) % 23,
  }))
}

function loadPosts(): Post[] {
  const saved = readJson<Post[] | null>(POSTS_KEY, null)
  if (saved) return saved
  const seeded = seedPosts()
  writeJson(POSTS_KEY, seeded)
  return seeded
}

const savePosts = (posts: Post[]) => writeJson(POSTS_KEY, posts)

/** 테스트·초기화용: 저장된 게시글을 지우고 초기 데이터로 되돌린다. */
export function resetDb() {
  localStorage.removeItem(POSTS_KEY)
}

// ── 인증 ──────────────────────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<User> {
  await delay()
  const found = USERS.find((u) => u.username === username.trim() && u.password === password)
  if (!found) throw new ApiError(401, '아이디 또는 비밀번호가 올바르지 않습니다.')
  return { username: found.username, name: found.name }
}

// ── 게시글 ────────────────────────────────────────────────────────────────
// asserts user is User : 이 함수가 통과하면 그 아래에서 user는 null이 아니라고 컴파일러가 인식한다
function requireUser(user: User | null): asserts user is User {
  if (!user) throw new ApiError(401, '로그인이 필요합니다.')
}

function validate({ title, content }: Partial<PostInput>): void {
  if (!title?.trim()) throw new ApiError(400, '제목을 입력하세요.')
  if (!content?.trim()) throw new ApiError(400, '내용을 입력하세요.')
}

/** 목록: 검색(q) + 최신순 + 페이지네이션 */
export async function listPosts({ q = '', page = 1, pageSize = 5, signal }: ListParams = {}): Promise<PostPage> {
  await delay()
  signal?.throwIfAborted()

  const keyword = q.trim().toLowerCase()
  const matched = loadPosts()
    .filter(
      (p) =>
        !keyword ||
        p.title.toLowerCase().includes(keyword) ||
        p.content.toLowerCase().includes(keyword) ||
        p.authorName.toLowerCase().includes(keyword),
    )
    .sort((a, b) => b.id - a.id) // 최신글(큰 id)이 위로

  const totalPages = Math.max(1, Math.ceil(matched.length / pageSize))
  const current = Math.min(Math.max(1, page), totalPages) // 범위를 벗어난 page는 보정
  const items = matched.slice((current - 1) * pageSize, current * pageSize)

  return { items, total: matched.length, page: current, totalPages }
}

/** 상세: 조회할 때마다 조회수 +1 (실제 서버라면 별도 요청으로 분리하는 것이 보통) */
export async function getPost(id: number | string, { signal }: { signal?: AbortSignal } = {}): Promise<Post> {
  await delay()
  signal?.throwIfAborted()

  const posts = loadPosts()
  const post = posts.find((p) => p.id === Number(id))
  if (!post) throw new ApiError(404, '존재하지 않는 게시글입니다.')

  post.views += 1
  savePosts(posts)
  return { ...post }
}

export async function createPost(values: PostInput, user: User | null): Promise<Post> {
  await delay()
  requireUser(user)
  validate(values)

  const posts = loadPosts()
  const post: Post = {
    id: Math.max(0, ...posts.map((p) => p.id)) + 1,
    title: values.title.trim(),
    content: values.content.trim(),
    author: user.username,
    authorName: user.name,
    createdAt: new Date().toISOString(),
    views: 0,
  }
  savePosts([...posts, post])
  return { ...post }
}

export async function updatePost(id: number | string, values: PostInput, user: User | null): Promise<Post> {
  await delay()
  requireUser(user)
  validate(values)

  const posts = loadPosts()
  const post = posts.find((p) => p.id === Number(id))
  if (!post) throw new ApiError(404, '존재하지 않는 게시글입니다.')
  if (post.author !== user.username) throw new ApiError(403, '작성자만 수정할 수 있습니다.') // 권한은 "서버"가 최종 검사

  post.title = values.title.trim()
  post.content = values.content.trim()
  savePosts(posts)
  return { ...post }
}

export async function deletePost(id: number | string, user: User | null): Promise<void> {
  await delay()
  requireUser(user)

  const posts = loadPosts()
  const post = posts.find((p) => p.id === Number(id))
  if (!post) throw new ApiError(404, '존재하지 않는 게시글입니다.')
  if (post.author !== user.username) throw new ApiError(403, '작성자만 삭제할 수 있습니다.')

  savePosts(posts.filter((p) => p.id !== post.id))
}
