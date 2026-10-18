# studyFinal. 응용 프로젝트 — 미니 게시판

> 이전: [study10](./study10.md) — 테스트 · 빌드 · SvelteKit 맛보기
> 목표: **study1~10에서 배운 것을 모두 모아 "목록 · 상세 · 검색 · 로그인"이 있는 작은 게시판을 만든다.**
> 코드: `JS_study/project/` (JavaScript) · `TS_study/project/` (TypeScript) — 두 폴더는 같은 화면과 같은 기능을 서로 다른 언어로 만든 것입니다.

```bash
cd JS_study/project      # 또는 TS_study/project
npm install
npm run dev              # http://localhost:5173
npm test                 # 테스트 50개
npm run build            # 배포용 빌드
```

데모 계정: **`hong` / `1234`**, **`kim` / `1234`**

---

## 1. 무엇을 만들었나

| 화면 | 주소 | 기능 |
|---|---|---|
| 글 목록 | `#/` | 최신순 5개씩, **검색**(제목·내용·작성자), **페이지네이션**, 검색어 강조 |
| 글 상세 | `#/posts/3` | 내용·조회수, **작성자에게만** 수정/삭제(삭제는 확인 단계 포함) |
| 글쓰기 | `#/write` | 로그인 필요(**라우트 가드**), 검증, 전송 중 상태 |
| 글 수정 | `#/posts/3/edit` | 로그인 + 작성자만, 기존 내용으로 시작 |
| 로그인 | `#/login` | 실패 안내, 로그인 후 **원래 가려던 곳으로** 복귀 |
| 404 | 그 외 | 안내 + 목록으로 |

공통: 헤더(현재 메뉴 강조, 로그인 사용자 이름, 로그아웃), 우하단 **토스트 알림**, 새로고침해도 **로그인 유지**, 게시글도 새로고침 후 유지(localStorage).

---

## 2. study 개념이 어디에 쓰였나

| 배운 것 | 쓰인 곳 |
|---|---|
| study1 템플릿·`{@html}` 주의 | 검색어 강조를 `{@html}` 없이 `<mark>`로 (XSS 방지), 글 내용은 `{…}` 보간으로 출력 |
| study2 `$state` `$derived` `$effect` | 폼 상태, 검증 오류 계산, 주소 → 검색 상태 파생, 주소가 바뀌면 다시 불러오기 |
| study3 props · 콜백 · `bind:` | `PostForm`(`onsubmit` 콜백), `SearchBar`(`onsearch`), `Pagination`(`hrefFor` 함수 prop), 폼 `bind:value` |
| study4 `{#if}` `{#each}` key · 검색/정렬 | 목록, 빈 상태 `{:else}`, 페이지 번호, 검색·페이지네이션 |
| study5 컴포넌트 합성 | `Header` · `Toast` · `PostForm` 등 컴포넌트 분리와 `<svelte:head>`로 페이지 제목 설정. (이 규모에서는 snippet 없이 props만으로 충분해서 snippet은 쓰지 않았다 — 필요해지면 `PostList`의 항목 모양을 `item` snippet으로 바꿀 수 있다) |
| study6 모듈 상태 · 클래스 스토어 | `auth.svelte.js`(`AuthStore` 클래스), `toast.svelte.js` |
| study7 라우팅 · 가드 | `svelte-spa-router` + `wrap({ conditions })` + `onConditionsFailed`, `use:link` `use:active` |
| study8 fetch 계층 · 취소 · 폼 | `lib/api.js`(비동기 API), `createResource`(요청 취소·로딩·오류), 검증·전송 흐름 |
| study9 transition · animate | 토스트의 `in:fly` `out:fly` `animate:flip` |
| study10 테스트 | 단위 + 통합 테스트 50개, 변이 확인 |

---

## 3. 폴더 구조

```
project/src/
├─ main.js · app.css · App.svelte        ← 시작점, 전역 스타일, 라우트 표 + 레이아웃
├─ lib/                                   ← 화면과 무관한 로직 (테스트하기 쉬움)
│  ├─ api.js                              ← 가짜 백엔드 (localStorage + 지연 + 권한 검사)
│  ├─ auth.svelte.js                      ← 로그인 상태 스토어
│  ├─ toast.svelte.js                     ← 알림 스토어
│  ├─ resource.svelte.js                  ← 비동기 상태(data/loading/error) 헬퍼
│  ├─ storage.js · text.js · redirect.js  ← 순수 함수 도우미
├─ components/                            ← 재사용 조각
│  ├─ Header · Toast · SearchBar · PostList · Pagination · PostForm
├─ routes/                                ← 라우트마다 하나, 데이터를 불러와 조립
│  ├─ Home · PostDetail · PostWrite · PostEdit · Login · NotFound
└─ tests/                                 ← lib 단위 테스트 + 컴포넌트 + 앱 통합 테스트
```

**역할 분리 원칙**

- `lib/` : 화면을 모르는 로직. 규칙(권한, 검색, 검증 보조)이 여기에 있다.
- `components/` : 데이터를 props로 받아 그리기만 한다. 어디서 온 데이터인지 모른다.
- `routes/` : 데이터를 불러오고(`createResource`), 컴포넌트를 조립한다.

---

## 4. 핵심 설계 포인트

### 4-1. 검색 상태의 원본은 주소다

```js
// routes/Home.svelte
const params = $derived(new URLSearchParams(router.querystring ?? ''))
const q    = $derived(params.get('q') ?? '')
const page = $derived(Math.max(1, Number(params.get('page')) || 1))

$effect(() => {
  list.load({ q, page })
  return () => list.abort()
})
```

```
검색 입력 → 주소 변경(#/?q=svelte&page=1) → q, page 파생 → $effect가 목록을 다시 불러옴 → 화면
```

- 검색어와 페이지를 `$state`로 따로 들고 있지 않고 **주소에서 파생**합니다. 그러면 새로고침, 뒤로가기, 링크 공유가 **공짜로** 동작합니다.
- 상태가 두 군데(주소와 변수)에 있으면 어긋나는 버그가 생깁니다(study7의 경쟁 상태). **원본을 하나로** 둡니다.
- 입력창에 "치고 있는 중"인 값(`draft`)만 따로 두고, 제출할 때 주소에 반영합니다.
- 기본값(빈 검색어, 1페이지)은 주소에서 생략해 `#/`로 깔끔하게 유지합니다.

### 4-2. 가짜 백엔드 — 진짜 서버로 갈아끼울 수 있게

```js
// lib/api.js
export async function listPosts({ q = '', page = 1, pageSize = 5, signal } = {}) {
  await delay()                  // 네트워크 지연 흉내
  signal?.throwIfAborted()       // 취소 지원
  ...
  return { items, total, page, totalPages }
}
```

- 모든 함수가 **Promise를 돌려주고, 시간이 걸리고, 실패(`ApiError`)할 수 있게** 만들었습니다. 그래서 화면은 로딩·오류·취소를 처음부터 제대로 다룹니다.
- 나중에 서버가 생기면 **이 파일의 함수 본문만** `fetch('/api/posts?...')`로 바꾸면 화면 코드는 거의 그대로입니다. (study8의 "API 계층 분리")
- 데이터는 localStorage에 저장돼서 새로고침해도 남고, `resetDb()`로 초기화할 수 있습니다.

### 4-3. 권한은 서버(api)가 최종 검사한다

```js
// lib/api.js
if (post.author !== user.username) throw new ApiError(403, '작성자만 수정할 수 있습니다.')
```

```svelte
<!-- routes/PostDetail.svelte -->
{#if isAuthor}  <a href=…>수정</a>  <button>삭제</button>  {/if}
```

- 화면에서 버튼을 숨기는 것은 **편의**입니다. 사용자가 주소로 `#/posts/1/edit`에 직접 들어가거나 개발자 도구로 요청을 보낼 수 있기 때문에, **실제 방어는 API 계층**이 합니다.
- 테스트도 두 겹으로 있습니다: `api.test.js`(다른 사람이 수정하면 403, 글은 그대로) + `App.test.js`(버튼이 안 보이고, 주소로 직접 가도 막힘).

### 4-4. 로그인 후 원래 가려던 곳으로

```js
// App.svelte
function onConditionsFailed(detail) {
  replace(`/login?redirect=${encodeURIComponent(detail.location)}`)   // 가드에 막히면 로그인으로
}

// routes/Login.svelte
const redirect = $derived(safeRedirect(new URLSearchParams(router.querystring ?? '').get('redirect')))
...
replace(redirect)   // 성공하면 원래 가려던 곳으로. replace라서 뒤로가기에 로그인 화면이 남지 않는다
```

```js
// lib/redirect.js — 주소창 값은 누구나 바꿀 수 있으므로 앱 안의 경로만 허용
safeRedirect('/write')                 // '/write'
safeRedirect('https://evil.example')   // '/'
safeRedirect('//evil.example')         // '/'
```

**열린 리다이렉트(open redirect)** 방지: `?redirect=` 값을 그대로 믿고 이동하면 공격자가 만든 링크로 로그인한 사용자를 다른 사이트로 보낼 수 있습니다.

### 4-5. 로딩 중에도 이전 목록을 유지

```svelte
{:else if list.data}
  <div class:stale={list.loading} aria-busy={list.loading}>      <!-- 새 결과를 기다리는 동안 흐리게 -->
    <PostList posts={list.data.items} {q} />
```

`createResource`는 새 요청을 보내도 이전 `data`를 지우지 않습니다. 검색어를 칠 때마다 화면이 "불러오는 중…"으로 깜빡이며 비는 것을 막고, 이전 결과를 흐리게 보여 줍니다. `aria-busy`로 보조 기기에도 알립니다.

### 4-6. 검색어 강조 — `{@html}` 없이

```js
splitByQuery('Svelte 게시판', 'sve')
// [{ text: 'Sve', match: true }, { text: 'lte 게시판', match: false }]
```

```svelte
{#each splitByQuery(post.title, q) as part}{#if part.match}<mark>{part.text}</mark>{:else}{part.text}{/if}{/each}
```

HTML 문자열로 `<mark>`를 끼워 `{@html}`로 출력하면 제목에 `<script>`가 있을 때 위험합니다(XSS). **데이터를 조각으로 나누고 템플릿이 감싸게** 하면 모든 텍스트가 자동으로 이스케이프됩니다. 정규식 특수문자(`.`, `(`)가 검색어에 있어도 `indexOf`로 찾기 때문에 안전합니다.

### 4-7. 폼: 검증 · 전송 · 오류

`PostForm`은 글쓰기와 수정이 함께 씁니다. study8의 패턴 그대로입니다.

- 검증 오류는 입력값에서 `$derived`로 **계산**
- 입력칸을 벗어난 뒤(`blur`)부터 오류 표시, 제출하면 전부 표시
- 전송 중 버튼 잠금(중복 제출 방지), `finally`에서 복구
- `onsubmit`(부모가 준 async 함수)이 던진 오류는 폼이 `role="alert"`로 표시, **입력은 유지**

수정 화면은 **데이터가 도착한 뒤에 폼을 만들기** 때문에 폼이 처음부터 기존 글로 시작합니다. (`initial`은 만들어질 때 한 번만 읽는 값이라 `svelte-ignore state_referenced_locally`로 의도를 표시)

### 4-8. 삭제는 두 단계

`삭제` → "정말 삭제할까요?" + `삭제 확인` / `취소`. `window.confirm()`은 브라우저 모양이 제각각이고 테스트하기 어려워서 **화면 안의 상태(`confirming`)** 로 만들었습니다. 다른 글로 이동하면 확인 단계가 자동으로 닫힙니다.

---

## 5. 테스트 — 50개

| 파일 | 종류 | 지키는 것 |
|---|---|---|
| `lib.test.js` | 단위 | `splitByQuery`(대소문자·여러 번·특수문자), `formatDate`, `safeRedirect`(악성 값) |
| `api.test.js` | 단위 | 로그인 401, 검색·페이지 보정, 조회수, 작성/수정/삭제 **권한 403/401/404**, 깨진 저장 데이터 복구 |
| `auth.svelte.test.js` | 단위 | 로그인/실패/로그아웃, **새로고침(모듈 재로딩) 후 유지** |
| `PostForm.test.js` | 컴포넌트 | 초기값, blur 후 오류 표시, 검증 실패 시 미호출, 공백 다듬기, 중복 제출 방지, 서버 오류 표시 |
| `App.test.js` | **통합** | 목록→검색→페이지→상세, 가드와 redirect 복귀, 로그인 실패, 작성→상세→삭제, 수정, **타인 글 보호**, 404 |

### 변이 확인 (테스트가 정말 문제를 잡는가)

| 일부러 망가뜨린 곳 | 실패한 테스트 |
|---|---|
| API의 작성자 검사 제거 | `api.test.js` — 다른 사람이 수정하면 403 |
| `/write` 라우트 가드 제거 | `App.test.js` — 로그인 화면으로 보내고 복귀 |
| 상세의 `isAuthor` 항상 true | `App.test.js` — 상세·타인 글 2건 |
| `safeRedirect` 검사 제거 | `lib.test.js` + `App.test.js` — 악성 redirect |

### 테스트를 쓰며 부딪힌 문제들 (통합 테스트의 현실)

| 증상 | 원인 | 해결 |
|---|---|---|
| 앞 테스트의 로그인 상태가 다음 테스트에 남음 | `auth`·`toasts`는 **모듈 싱글톤** — `localStorage`만 지워서는 초기화되지 않음 | `afterEach`에서 `auth.logout()`, `toasts.length = 0` |
| 특정 테스트가 순서에 따라 실패 | `hashchange`가 비동기로 도착해 라우터의 전역 주소 상태가 한 박자 늦게 초기화 | `afterEach`에서 주소 초기화 후 이벤트가 처리될 때까지 대기 |
| `getByText`가 제목을 못 찾음 | 검색어 `e`가 `<mark>`로 강조되어 글자가 여러 요소로 쪼개짐 | 이어 붙인 접근 가능한 이름으로 찾기 — `getByRole('link', { name })` |
| `getByLabelText('아이디')` 실패 | 라우터가 페이지를 **비동기로** 그림 | 첫 요소는 `await findBy…` |
| `getByRole('status')`가 2개 | 토스트 영역과 "불러오는 중…"이 모두 status | 토스트 영역에 `aria-label="알림"` → `getByRole('status', { name: '알림' })` (접근성도 개선) |
| 앱 전체를 `vi.resetModules()`로 재로딩하는 테스트가 깨짐 | 테스트 도구는 옛 Svelte 런타임, 앱은 새 런타임 → 섞임 | 앱 레벨 대신 `auth` 단위 테스트로 검증 |
| 내 가정이 틀림 | `q=svelte`는 4건뿐이라 2페이지가 없음 (앱 오류 아님) | 계산해 보고 9건인 `q=e`로 변경 |

> 통합 테스트는 쓰기 어렵지만, **여러 부품이 맞물릴 때만 생기는 버그**(경쟁 상태, 상태 누수, 비동기 순서)를 잡는 유일한 방법입니다. 이 프로젝트에서도 단위 테스트가 모두 통과한 상태에서 통합 테스트가 상태 누수를 먼저 드러냈습니다.

---

## 6. Vue / React로 같은 게시판을 만든다면 (비교 학습)

노션의 학습 목표 "게시판 UI를 Vue/React와 같이 만들어 비교"를 위한 대응표입니다. Vue·React 저장소의 게시판과 나란히 놓고 보세요.

| 기능 | React | Vue 3 | **Svelte 5 (이 프로젝트)** |
|---|---|---|---|
| 라우팅 | React Router | Vue Router | svelte-spa-router |
| 주소 → 검색 상태 | `useSearchParams()` | `useRoute().query` | `router.querystring` + `$derived` |
| 목록 불러오기 | `useEffect` + `fetch` 또는 TanStack Query | `watch`/`onMounted` 또는 TanStack Query | `$effect` + `createResource` |
| 요청 취소 | effect cleanup에서 `abort()` | `onCleanup` | `$effect` cleanup에서 `abort()` |
| 로그인 전역 상태 | Context / Zustand / Redux | Pinia | `.svelte.js` 클래스 (`AuthStore`) |
| 라우트 가드 | `<ProtectedRoute>` 컴포넌트 / loader | `beforeEach` | `wrap({ conditions })` |
| 폼 | controlled input, React Hook Form | `v-model`, VeeValidate | `bind:value` + `$derived` 검증 |
| 파생 값 | `useMemo` | `computed` | `$derived` |
| 토스트 애니메이션 | Framer Motion | `<TransitionGroup>` | 내장 `in:` `out:` `animate:flip` |
| 컴포넌트 합성 | `children`, props | slot | `children`, snippet |
| 테스트 | Vitest/Jest + RTL | Vitest + Vue Test Utils | Vitest + Testing Library (Svelte) |

**같은 기능을 만들며 느낀 차이**

- Svelte: 상태 선언이 변수 하나(`$state`)이고, `useEffect` 의존성 배열이나 `useMemo` 같은 **"재실행 대비 장치"가 없다.** 코드가 짧아진다.
- 대신 "룬이 어디서 동작하는가"(`.svelte`/`.svelte.js`), "구조 분해하면 반응성이 끊긴다"처럼 **Svelte 특유의 규칙**을 익혀야 한다.
- 번들 크기: `npm run build` 결과 이 게시판 전체(라우터 라이브러리 포함)가 **JS 약 28 kB + CSS 약 1.5 kB (gzip)** 이다. (JS/TS 프로젝트 모두 비슷)

---

## 7. TypeScript 버전 메모

JS와 **동작이 같고 타입만 더해진** 프로젝트입니다.

```ts
// lib/api.ts — 도메인 타입을 한곳에 정의
export interface User { username: string; name: string }
export interface Post { id: number; title: string; content: string; author: string; authorName: string; createdAt: string; views: number }
export type PostInput = Pick<Post, 'title' | 'content'>      // 폼이 보내는 값만 골라낸 타입
export interface PostPage { items: Post[]; total: number; page: number; totalPages: number }
```

```ts
// 로그인하지 않았으면 던지는 함수 — 통과하면 아래에서 user는 null이 아니다
function requireUser(user: User | null): asserts user is User {
  if (!user) throw new ApiError(401, '로그인이 필요합니다.')
}
```

```svelte
<script lang="ts">
  // 제네릭으로 응답 타입과 load() 매개변수 타입을 지정 → list.data.items 등이 자동완성
  const list = createResource<PostPage, { q: string; page: number }>(({ q, page }, signal) => listPosts({ q, page, signal }))
</script>
```

| JS | TS에서 더해진 것 |
|---|---|
| `readJson(key, fallback)` | `readJson<T>(key, fallback): T` — 저장 타입을 호출하는 쪽이 지정 |
| `createResource(fetcher)` | `createResource<T, P>` 제네릭 + `isAbortError(e: unknown)` |
| `onConditionsFailed(detail)` | `detail: RouteDetail` (svelte-spa-router 제공 타입) |
| 컴포넌트 props | `interface Props` + `$props()` |
| `catch (err) { err.message }` | `err instanceof Error ? err.message : '…'` — `unknown` 좁히기 |
| `params` | `{ params }: { params: { id: string } }` — 라우트 파라미터는 **항상 문자열** |

- `asserts user is User` 덕분에 `createPost`·`updatePost` 안에서 `user.username`을 `null` 걱정 없이 쓸 수 있습니다.
- `npm run check`가 컴포넌트·테스트까지 모두 검사합니다. (이 프로젝트: 249개 파일, 오류 0)

---

## 8. 한계와 다음 단계

| 지금 | 실제 서비스라면 |
|---|---|
| 비밀번호를 프런트 코드에 둠 | **서버**에서 해시로 검증, 로그인 후 세션 쿠키/토큰 발급 (프런트에 두면 누구나 볼 수 있음) |
| 데이터가 브라우저 localStorage에 | 데이터베이스 + 서버 API |
| 해시 라우팅(`#/`) | 히스토리 라우팅 + SSR → **SvelteKit** (검색엔진 노출, 첫 화면 속도) |
| 권한 검사를 흉내 낸 `api.js` | 서버가 토큰으로 사용자를 식별하고 검사 |
| 조회수를 GET에서 증가 | 별도 요청 또는 서버에서 중복 방지 |

### 도전 과제

1. **댓글** : `comments` 저장소와 `listComments/createComment/deleteComment`를 `api.js`에 추가하고, 상세 화면 아래에 목록 + 입력창 (로그인 필요, 작성자만 삭제)
2. **내 글만 보기** : 목록에 `?author=hong` 필터와 탭 UI (주소가 원본이라는 원칙 유지)
3. **페이지 크기 선택** : 5/10/20 `select` → `?size=10` (`Pagination`·`api`·테스트 함께 수정)
4. **진짜 서버로 교체** : 간단한 Node/Express 또는 SvelteKit `+server.js`로 같은 시그니처의 API를 만들고, `api.js`의 본문만 `fetch`로 바꿔 테스트가 그대로 통과하는지 확인 (테스트의 `config.latency` 대신 `fetch` 모킹 필요)
5. **SvelteKit으로 이전** : 라우트를 `src/routes/...`로 옮기고 목록·상세 데이터는 `load()`, 글쓰기·로그인은 form actions로 바꿔 보기 (study10의 대응표 참고)
6. **접근성 점검** : 키보드만으로 모든 기능 사용해 보기, 스크린 리더 낭독 확인, 포커스 이동(글 등록 후 제목에 포커스 등)

---

## 확인 문제

1. 검색어와 페이지를 `$state`가 아니라 **주소에서 파생**시킨 이유는? 이렇게 하면 무엇이 공짜로 생기는가?
2. 작성자만 보이는 수정/삭제 버튼과 `api.js`의 403 검사 중 **어느 쪽이 진짜 방어**이고, 왜 둘 다 필요한가?
3. `?redirect=` 값을 `safeRedirect`로 검사하는 이유는?
4. 검색어 강조에서 `{@html}` 대신 `splitByQuery`를 쓴 이유는?
5. 통합 테스트에서 `localStorage.clear()`만으로는 테스트가 격리되지 않았던 이유와 해결 방법은?
6. 이 게시판을 SvelteKit으로 옮긴다면 `Home.svelte`의 `createResource + $effect`는 무엇으로 바뀌는가?

## 마무리 — 지금까지의 여정

```
study0  이론       → 컴파일러 기반, 룬
study1  시작       → 프로젝트·템플릿
study2  반응형     → $state $derived $effect
study3  통신       → props · 콜백 · bind
study4  렌더링     → 조건 · 리스트 · key
study5  합성       → children · snippet
study6  공유 상태  → .svelte.js · context · store
study7  라우팅     → 해시 라우터 · 가드
study8  API 연동   → fetch · 취소 · 폼 · 낙관적 업데이트
study9  움직임     → transition · action · 생명주기
study10 품질       → Vitest · 빌드 · SvelteKit 맛보기
Final   종합       → 미니 게시판  ←  여기
다음    SvelteKit  → 파일 라우팅 · load · form actions · SSR · 배포
```
