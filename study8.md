# study8. 고급 기술 구현 3 — 폼 + `fetch`로 API 연동

> 이전: [study7](./study7.md) — 라우팅
> 이번 목표: **서버에서 데이터를 가져오고(GET), 보내고(POST), 지우는(DELETE) 화면을 안정적으로 만든다.**
> 로딩·오류·취소·검증·실패 복구까지.
> 실습 코드: `src/lessons/study8/`
> 파일: `lib/api.js` · `lib/resource.svelte.js` · `AwaitDemo` · `ResourceDemo` · `PostForm` · `PostManager` · `Lesson`
> 사용 API: [JSONPlaceholder](https://jsonplaceholder.typicode.com) (연습용 공개 REST API, 인터넷 연결 필요)

---

## 1. 비동기 UI의 4가지 상태

서버 요청이 있는 화면은 데이터가 "있다/없다" 둘이 아니라 **네 가지 상태**를 가집니다.

```
          요청 시작
 idle ──────────▶ loading ──성공──▶ success (data)
                     └──────실패──▶ error   (error)
```

| 상태 | 화면에 보여 줄 것 |
|---|---|
| loading | 스피너, "불러오는 중…" , 버튼 비활성 |
| success | 데이터 |
| error | 오류 메시지 + **다시 시도** 버튼 |
| empty | "결과가 없습니다" (success이지만 길이 0) |

네 상태를 모두 그리지 않으면 "아무 반응이 없는 화면"이 됩니다. 이번 실습의 모든 컴포넌트가 이 상태들을 처리합니다.

---

## 2. API 계층 분리 — `lib/api.js`

```js
export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(BASE + path, {
    method, signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new ApiError(res.status, `요청에 실패했습니다 (HTTP ${res.status})`)
  return res.json()
}

export const getPost    = (id, opts)  => request(`/posts/${id}`, opts)
export const createPost = (data)      => request('/posts', { method: 'POST', body: data })
export const deletePost = (id)        => request(`/posts/${id}`, { method: 'DELETE' })
```

### 반드시 알아야 할 `fetch`의 함정

> **`fetch`는 404, 500에서도 reject하지 않습니다.**
> 네트워크가 끊겼을 때만 reject합니다. HTTP 오류는 `res.ok === false`로 직접 확인해야 합니다.

```js
const res = await fetch('/없는-주소')
res.ok      // false
res.status  // 404
// 그런데 catch로는 가지 않는다!  → if (!res.ok) throw ... 를 직접 써야 한다
```

- **한 곳(`request`)에서 처리**하면 모든 API 함수가 같은 규칙을 따릅니다. 컴포넌트는 `fetch`를 직접 호출하지 않고 `getPost`, `createPost`만 씁니다.
- 컴포넌트가 URL, 헤더, JSON 변환을 모르게 하면 나중에 서버 주소가 바뀌어도 한 파일만 고치면 됩니다. (React/Vue에서도 같은 구조: `services/api.ts`)
- `Content-Type: application/json` 헤더와 `JSON.stringify(body)`는 **본문을 보낼 때 항상 한 쌍**입니다.

---

## 3. `{#await}` — Promise를 템플릿에서 바로 (`AwaitDemo`)

```svelte
<script>
  let id = $state(1)
  const promise = $derived(getPost(id))      // id가 바뀌면 새 요청이 만들어진다
</script>

{#await promise}
  <p>불러오는 중…</p>
{:then post}
  <h4>#{post.id} {post.title}</h4>
{:catch error}
  <p>⚠️ {error.message}</p>
{/await}
```

- loading / success / error를 **세 블록으로 선언**합니다. 상태 변수를 직접 만들 필요가 없습니다.
- `id`가 바뀌어 새 Promise가 만들어지면, 이전 요청이 늦게 도착해도 **가장 최근 Promise의 결과만** 반영됩니다.
- 한계: 다시 시도, 요청 취소, 로딩 중 이전 데이터 유지 같은 세밀한 제어가 어렵습니다. → 다음 절의 `createResource`.

---

## 4. 재사용 가능한 `createResource` (`lib/resource.svelte.js`)

React의 `useQuery`/SWR, Vue의 `useFetch`에 해당하는 것을 룬으로 직접 만든 헬퍼입니다.

```js
const posts = createResource(({ userId }, signal) => listPosts({ userId, signal }))

posts.load({ userId: 2 })     // 요청 시작
posts.data                    // 반응형: 결과
posts.loading                 // 반응형: 진행 중?
posts.error                   // 반응형: 오류 (없으면 null)
```

내부의 핵심 두 가지.

### (1) 새 요청 전에 이전 요청을 취소 — `AbortController`

```js
async function load(params) {
  controller?.abort()                       // 진행 중이던 요청 취소
  const mine = (controller = new AbortController())
  ...
  const result = await fetcher(params, mine.signal)   // signal을 fetch에 전달해야 실제로 취소됨
  if (mine === controller) data = result              // "내가 최신 요청"일 때만 반영
}
```

**왜 필요한가 (경쟁 상태)**: 필터를 빠르게 바꾸면 요청이 여러 개 나갑니다. 응답은 보낸 순서대로 도착한다는 보장이 없어서, 느린 옛 응답이 나중에 도착하면 **오래된 결과가 최신 결과를 덮어씁니다.**

```
필터 A 선택 ──요청 A (느림) ───────────────┐
필터 B 선택 ──요청 B (빠름) ──┐             │
                              ▼             ▼
                    화면: B 결과 ──▶ A 결과로 덮어써짐 ❌  (취소하지 않았다면)
```

실습의 테스트에서 "첫 요청은 느리게, 곧바로 필터를 바꾸면 첫 요청이 abort되고 화면에는 마지막 결과만 남는다"를 확인했습니다.

### (2) `AbortError`는 오류가 아니다

```js
catch (e) {
  if (e?.name === 'AbortError') return    // 정상적인 취소 → 오류 메시지로 보여 주지 않는다
  error = e
}
finally {
  if (mine === controller) loading = false   // 오래된 요청이 끝났다고 로딩을 끄면 안 된다
}
```

---

## 5. `$effect`로 "값이 바뀌면 다시 불러오기" (`ResourceDemo`)

```svelte
<script>
  let userId = $state('')
  const posts = createResource(({ userId }, signal) => listPosts({ userId, signal }))

  $effect(() => {
    posts.load({ userId })          // userId를 읽었으므로 바뀔 때마다 재실행
    return () => posts.abort()      // 재실행 직전 + 컴포넌트가 사라질 때 요청 취소
  })
</script>
```

- study2에서 배운 `$effect`의 **cleanup**이 여기서 진가를 발휘합니다.
- 컴포넌트가 사라졌는데 응답이 도착해 상태를 건드리는 문제도 `abort()`로 함께 막습니다.
- 화면에서는 네 상태를 `{#if}`로 나눕니다.

```svelte
{#if posts.loading}        불러오는 중…
{:else if posts.error}     오류 + 다시 시도 버튼
{:else if posts.data}      {#each} ... {:else} 결과 없음 {/each}
{/if}
```

> **한 번만 불러올 때는** `onMount`가 더 읽기 쉽습니다. (`PostManager`)
> ```js
> onMount(() => { list.load(); return () => list.abort() })
> ```
> `onMount`는 컴포넌트가 화면에 붙은 직후 1회 실행됩니다. 자세한 생명주기는 study9에서 다룹니다.

---

## 6. 폼 검증과 전송 (`PostForm`)

### 6-1. 검증은 "저장"이 아니라 "계산"

```js
const errors = $derived({
  title: form.title.trim().length < 3 ? '제목은 3자 이상 입력하세요.' : '',
  body:  form.body.trim().length < 10 ? '내용은 10자 이상 입력하세요.' : '',
})
const valid = $derived(!errors.title && !errors.body)
```

오류 메시지를 상태로 따로 저장하면 입력과 어긋날 수 있습니다. **입력값에서 파생**시키면 항상 일치합니다.

### 6-2. 언제 오류를 보여 줄까 — `touched`

처음부터 빨간 오류를 보여 주면 사용자가 아직 입력도 안 했는데 야단맞는 느낌입니다.

```svelte
<input bind:value={form.title} onblur={() => (touched.title = true)} aria-invalid={touched.title && !!errors.title} />
<p class="error">{touched.title ? errors.title : ''}</p>
```

- 입력칸을 **한 번 벗어난 뒤**(`blur`)부터 오류 표시
- 제출을 누르면 `touched`를 전부 `true`로 → 모든 오류를 한꺼번에 표시
- `aria-invalid`, `aria-describedby`로 스크린 리더에도 알림 (접근성)

### 6-3. 제출 흐름

```js
async function onsubmit(e) {
  e.preventDefault()
  touched = { title: true, body: true }
  if (!valid || submitting) return          // 검증 실패 or 중복 제출 방지

  submitting = true
  serverError = ''
  try {
    const created = await createPost({ ... })
    oncreated?.(created)                    // 부모에게 알림 (콜백 prop)
    form = { title: '', body: '' }          // 성공했을 때만 폼 초기화
  } catch (err) {
    serverError = err.message               // 실패하면 입력은 그대로 둔다 → 다시 시도 가능
  } finally {
    submitting = false                      // 성공/실패와 상관없이 항상 버튼 복구
  }
}
```

| 체크리스트 | 이유 |
|---|---|
| `submitting` 동안 버튼 비활성 + "저장 중…" | 더블 클릭으로 중복 등록 방지 |
| 실패해도 입력 유지 | 사용자가 다시 쓰지 않아도 됨 |
| `finally`에서 `submitting = false` | 오류 때 버튼이 영원히 잠기는 버그 방지 |
| 서버 오류는 `role="alert"`로 표시 | 스크린 리더가 즉시 읽음 |

---

## 7. 낙관적 업데이트(Optimistic Update) (`PostManager`)

```js
async function remove(post) {
  const before = list.data
  list.data = before.filter((p) => p.id !== post.id)   // ① 응답을 기다리지 않고 먼저 지운다
  try {
    await deletePost(post.id)                           // ② 서버에 요청
  } catch (e) {
    list.data = before                                  // ③ 실패하면 되돌린다 (롤백)
    notice = `삭제에 실패해서 되돌렸습니다. (${e.message})`
  }
}
```

- 서버 응답을 기다리면 사용자는 "버튼이 반응이 없네?" 하고 느낍니다. 성공할 확률이 높은 동작은 **먼저 반영하고 실패 시에만 되돌리는 방식**이 체감이 훨씬 빠릅니다.
- 반드시 **롤백 경로**(원래 데이터를 보관해 두었다가 복원)와 **사용자 안내**를 함께 만들어야 합니다.
- 화면의 "저장/삭제 요청 실패 시뮬레이션" 체크를 켜고 삭제해 보면 사라졌다가 되돌아오는 것을 볼 수 있습니다.

> **JSONPlaceholder의 한계**: 이 API는 POST/DELETE가 성공 응답만 주고 실제로는 저장하지 않습니다. 그래서 새 글에는 화면용 고유 id를 붙여 목록에 직접 추가했습니다. 진짜 백엔드라면 서버가 돌려준 데이터를 그대로 쓰거나 목록을 다시 불러오면 됩니다.

---

## 8. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 데이터 요청 | `useEffect` + `fetch` / **TanStack Query** / SWR | `onMounted` + `fetch` / VueUse `useFetch` / TanStack Query | `onMount`·`$effect` + `fetch` / `createResource`(직접) / TanStack Query |
| 템플릿에서 Promise | (Suspense + `use()`) | (Suspense) | `{#await}` |
| 요청 취소 | `useEffect` cleanup에서 `abort()` | `watch`의 `onCleanup` | `$effect` cleanup에서 `abort()` |
| 폼 | controlled input (`value` + `onChange`), React Hook Form | `v-model`, VeeValidate | `bind:value`, 파생 검증 |
| 전송 중 상태 | `useState(false)` | `ref(false)` | `$state(false)` |
| 검증 결과 | `useMemo` / 렌더 중 계산 | `computed` | `$derived` |

> 실제 서비스에서는 캐싱·재시도·중복 제거가 필요해지는데, 이때는 직접 만들기보다 **TanStack Query**(`@tanstack/svelte-query`)를 쓰는 것이 일반적입니다. `createResource`는 그 원리를 이해하기 위한 최소 구현입니다.

---

## 9. TypeScript 버전 메모

```ts
export interface Post { id: number; userId: number; title: string; body: string }
export type NewPost = Omit<Post, 'id'>            // id는 서버가 정하므로 보낼 때는 제외

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> { ... return (await res.json()) as T }
export const getPost = (id: number): Promise<Post> => request<Post>(`/posts/${id}`)
```

```ts
// 제네릭 헬퍼 : T = 응답 타입, P = load()의 매개변수 타입
export function createResource<T, P = void>(fetcher: (params: P, signal: AbortSignal) => Promise<T>) {
  let data = $state<T | undefined>(undefined)
  let error = $state<Error | null>(null)
  ...
}
const posts = createResource(({ userId }: { userId: string }, signal) => listPosts({ userId, signal }))
posts.data   // Post[] | undefined   ← listPosts의 반환 타입에서 자동 추론
```

- **`res.json()`은 런타임에 아무것도 검증하지 않습니다.** `as T`는 "그렇다고 믿겠다"는 선언일 뿐이므로, 외부 데이터가 중요하면 zod 같은 스키마 검증 라이브러리를 씁니다.
- `catch (e)`의 `e`는 `unknown`이라서 `e instanceof Error`로 확인한 뒤 `message`를 읽습니다.
- 단, **취소(AbortError) 판별은 `instanceof Error`를 쓰지 않습니다.** `DOMException`은 실행 환경(브라우저·jsdom·Node)에 따라 `Error`를 상속하지 않는 경우가 있어서, 객체의 `name`을 비교하는 `isAbortError(e)` 헬퍼를 만들었습니다. (study10 테스트에서 발견)
- `Omit<Post, 'id'>`, `Record<string, never>` 같은 유틸리티 타입으로 API 계약을 표현합니다.

---

## 10. 자주 하는 실수

1. **`res.ok` 확인 누락** → 404/500도 성공으로 처리되어 `undefined`를 렌더링하다 터짐
2. **`signal`을 `fetch`에 안 넘김** → `abort()`를 불러도 실제 요청이 취소되지 않음
3. **`AbortError`를 오류로 표시** → 필터를 바꿀 때마다 빨간 오류가 번쩍임
4. **`finally` 대신 성공 경로에서만 `submitting = false`** → 실패하면 버튼이 영원히 잠김
5. **응답을 `catch` 없이 `await`** → 처리되지 않은 Promise rejection
6. **낙관적 업데이트 후 롤백 누락** → 서버와 화면이 영구적으로 달라짐
7. **오류를 상태로 따로 저장하는 검증** → 입력을 고쳐도 옛 오류가 남음. `$derived`로 계산

## 확인 문제

1. `fetch('/없는-주소')`는 404일 때 `catch`로 가는가? 어떻게 처리해야 하는가?
2. 필터를 빠르게 바꿀 때 왜 이전 요청을 `abort()`해야 하는가? 안 하면 어떤 일이 생기는가?
3. 폼에서 `touched`를 쓰는 이유는?
4. 낙관적 업데이트가 일반 업데이트와 다른 점, 그리고 반드시 필요한 두 가지는?
5. 제출 함수에서 `submitting = false`를 `finally`에 두는 이유는?

## 직접 해보기

- `createResource`에 `retry(times)`를 추가해 실패하면 최대 2번 자동으로 재시도하기
- `PostManager`에 수정(PUT) 기능을 추가: 제목을 클릭하면 입력창으로 바뀌고 저장 시 낙관적 업데이트
- `ResourceDemo`에 검색어 입력창을 추가하고, 매 글자마다 요청이 나가지 않도록 300ms **디바운스**(`setTimeout` + `$effect` cleanup)를 적용하기
