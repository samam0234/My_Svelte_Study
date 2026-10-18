# study7. 고급 기술 구현 2 — 라우팅

> 이전: [study6](./study6.md) — 공유 상태
> 이번 목표: **주소(URL)에 따라 화면을 바꾸는 SPA 라우팅을 이해하고, 두 가지 방법으로 만든다.**
> A. 직접 만든 작은 해시 라우터 / B. `svelte-spa-router` 라이브러리
> 실습 코드: `src/lessons/study7/`
> 폴더: `custom/` (직접 만든 라우터) · `library/` (svelte-spa-router) · `pages/` (두 방식이 **공유**하는 페이지들)

---

## 1. 라우팅이란

SPA(Single Page Application)는 HTML 페이지가 **하나뿐**입니다. 그래서 "주소가 바뀌면 다른 화면"을 보여 주려면 JS가 주소를 읽어서 컴포넌트를 갈아 끼워야 합니다.

```
주소 : index.html#/users/2
              └──────┘
       이 부분(해시)을 읽어서
       /users/:id  패턴과 비교 → UserDetail 컴포넌트, params = { id: '2' }
```

### 해시(#) 라우팅 vs 히스토리 라우팅

| | 해시 라우팅 | 히스토리 라우팅 |
|---|---|---|
| 주소 모양 | `site.com/#/users/2` | `site.com/users/2` |
| 서버 설정 | **필요 없음** (정적 호스팅 OK) | 모든 경로를 `index.html`로 돌리는 설정 필요 |
| SEO | 불리 | 유리 (SSR과 함께 쓰면 최상) |
| 사용처 | 관리자 화면, 학습, 정적 배포 | 일반 서비스 → **SvelteKit**이 이 방식 |

이 저장소의 Vite SPA 실습은 **해시 라우팅**으로 진행합니다. 서버 없이 `npm run build` 결과물만으로 동작하기 때문입니다.

### 라우팅에 필요한 4가지

1. **현재 위치 읽기** : `location.hash` → `path`, `query`
2. **라우트 표** : `패턴 → 컴포넌트`
3. **매칭** : 패턴과 path를 비교해 파라미터 추출
4. **이동** : 링크(`<a href="#/...">`) 또는 코드(`location.hash = ...`)

---

## 2. A. 직접 만든 라우터 (`custom/`)

### 2-1. 패턴 매칭 — `matchPath`

```js
matchPath('/users/:id', '/users/3')          // { id: '3' }
matchPath('/users/:id', '/users')            // null  (맞지 않음)
matchPath('/', '/')                          // {}    (맞지만 파라미터 없음)
```

패턴의 `:id` 부분을 정규식 `([^/]+)`로 바꾸고, 맞으면 캡처한 값을 이름과 짝지어 돌려줍니다.
**순수 함수**라서 컴포넌트 없이 테스트하기 쉽습니다.

### 2-2. 라우터 상태 — `router.svelte.js`

```js
class RouterState {
  path = $state('/')
  query = $state(new URLSearchParams())
  sync() { /* location.hash 를 읽어 path / query 갱신 */ }
}
export const router = new RouterState()   // study6의 "클래스 + 룬" 패턴
```

- 주소(`path`)를 **하나의 반응형 상태**로 만들면, 이 값을 읽는 컴포넌트(링크 강조, 화면 전환)가 자동으로 갱신됩니다.
- `query`는 `#/users/3?tab=posts`의 `?` 뒤를 `URLSearchParams`로 파싱합니다.

### 2-3. 화면 전환 — `RouterView.svelte`

```svelte
<script>
  let { routes, fallback } = $props()

  const matched = $derived.by(() => {                // 현재 path와 맞는 첫 라우트
    for (const route of routes) {
      const params = matchPath(route.path, router.path)
      if (params) return { route, params }
    }
    return null
  })
  const View = $derived(matched?.route.component ?? fallback)
</script>

<svelte:window onhashchange={() => router.sync()} />   <!-- 주소 해시가 바뀌면 다시 읽기 -->
<View params={matched?.params ?? {}} />
```

- `$derived`로 "어떤 컴포넌트를 보일지"를 계산하고, 컴포넌트를 변수(`View`)에 담아 `<View />`로 그립니다. (Svelte 5는 이게 가능)
- 라우트 **순서가 중요**합니다. 위에서부터 처음 맞는 것이 선택됩니다.
- 라우트에 맞는 게 없으면 `fallback`(404)을 보여 줍니다.

### 2-4. 링크 강조 — `NavLink.svelte`

```svelte
const active = $derived(exact ? router.path === to : router.path === to || router.path.startsWith(to + '/'))
<a href={'#' + to} class:active aria-current={active ? 'page' : undefined}>...</a>
```

해시 라우팅에서는 링크가 그냥 `<a href="#/users">`면 됩니다. 클릭하면 브라우저가 해시를 바꾸고 `hashchange` 이벤트가 발생합니다.
`/`는 모든 경로의 접두사이므로 홈 링크에는 `exact`를 줍니다.

### 2-5. 라우트 가드 (접근 제한)

```js
{ path: '/admin', component: Admin, guard: () => (auth.user ? null : '/login') }
```

```svelte
const redirectTo = $derived(matched?.route.guard?.() ?? null)
$effect(() => { if (redirectTo) navigate(redirectTo, { replace: true }) })
```

- `guard()`가 **문자열**을 돌려주면 그 경로로 보내고, `null`이면 통과합니다.
- `auth.user`(반응형)를 읽는 `$derived`이므로 로그인 상태가 바뀌면 자동으로 다시 평가됩니다.
- 이동은 부수 효과이므로 `$derived`가 아니라 **`$effect`** 에서 합니다.
- `replace: true` : 뒤로가기 기록에 남기지 않습니다. (뒤로가면 다시 `/admin`→`/login`으로 튕기는 무한 반복 방지)

### 2-6. 실습 중 만난 함정 : 경쟁 상태(race condition)

관리자 페이지의 **로그아웃** 버튼은 이렇게 동작합니다.

```js
function onLogout() {
  logout()                // 1) auth.user = null
  location.hash = '#/'    // 2) 홈으로 이동
}
```

처음에는 홈이 아니라 **로그인 화면**으로 갔습니다. 순서가 이렇기 때문입니다.

```
logout() ─▶ guard가 다시 평가됨(로그인 안 됨) ─▶ $effect가 "/login으로 보내자" (마이크로태스크, 즉시)
location.hash = '#/' ─▶ hashchange 이벤트는 나중에 도착 (태스크)
→ 결과: 가드의 리다이렉트가 먼저 이겨서 /login
```

해결: 가드가 리다이렉트하기 직전에 `location.hash`를 다시 읽어서, **이미 다른 주소로 이동 중이면 그쪽을 존중**합니다.

```js
$effect(() => {
  if (!redirectTo) return
  if (readHash().path !== router.path) return    // 이미 다른 곳으로 가는 중 → 가드는 양보
  navigate(redirectTo, { replace: true })
})
```

> 교훈: **반응형 상태 변화(즉시)** 와 **브라우저 이벤트(나중)** 의 순서는 다를 수 있다. 상태와 URL처럼 "두 군데에 사는 값"을 맞출 때 생기는 전형적인 버그입니다.

---

## 3. B. `svelte-spa-router` 라이브러리 (`library/`)

```bash
npm install svelte-spa-router      # v5 : Svelte 5 전용
```

### 3-1. 라우트 정의 + 렌더링

```svelte
<script>
  import Router from 'svelte-spa-router'
  import { wrap } from 'svelte-spa-router/wrap'

  const routes = {
    '/': Home,
    '/users': Users,
    '/users/:id': UserDetail,           // 컴포넌트가 params prop으로 { id } 를 받는다
    '/admin': wrap({ component: Admin, conditions: [() => auth.user !== null] }),
    '*': NotFound,                      // catch-all : 반드시 마지막
  }
</script>

<Router {routes} onConditionsFailed={() => replace('/login')} />
```

| 패턴 | 의미 |
|---|---|
| `/users` | 정확히 `/users` |
| `/users/:id` | 이름 있는 파라미터 → `params.id` |
| `/users/:id/:tab?` | `?` 붙은 마지막 파라미터는 선택 |
| `/book/*` | `/book/` 뒤에 무엇이든 (`params.wild`) |
| `*` | 나머지 전부 (404) |

### 3-2. 이동

```svelte
<script>
  import { link, push, pop, replace, router } from 'svelte-spa-router'
  import active from 'svelte-spa-router/active'
</script>

<a href="/users" use:link>사용자</a>                        <!-- '#' 없이 쓰고 use:link가 변환 -->
<a href="/users" use:link use:active={/^\/users/}>사용자</a>  <!-- 현재 경로면 class="active" -->
<button onclick={() => push('/users/2')}>이동</button>       <!-- 코드로 이동 -->
<p>현재 위치: {router.location}</p>                            <!-- 반응형 -->
```

| API | 설명 |
|---|---|
| `use:link` | `<a>`의 `href="/path"`를 `#/path`로 바꾸고 클릭 처리 |
| `use:active` | 현재 경로와 맞으면 클래스(기본 `active`) 부여. 인자는 문자열·정규식·옵션 객체 |
| `push(url)` / `replace(url)` / `pop()` | 이동 / 기록 안 남기고 이동 / 뒤로 |
| `router.location`, `router.querystring`, `router.params` | 현재 상태 (반응형) |
| `wrap({ component, conditions, props, asyncComponent })` | 가드, 정적 props, 코드 분할(lazy) |

### 3-3. 직접 해 보고 알게 된 점

- **`use:active={'/users/*'}` 는 `/users` 자체에는 켜지지 않습니다.** `/users/2`처럼 뒤에 무언가 있어야 맞습니다. `/users`와 `/users/2` 모두 켜려면 정규식 `use:active={/^\/users/}`.
- `use:active`가 붙이는 클래스는 라우터가 직접 DOM에 추가하므로, 컴포넌트의 스코프 스타일이 닿지 않습니다. CSS는 `nav :global(a.active) { ... }`로 써야 합니다.
- `conditions`는 **이동하는 순간에만** 평가됩니다. (직접 만든 라우터는 상태가 바뀔 때마다 평가) 로그아웃 시에는 코드로 홈으로 보내야 합니다.
- 코드 분할이 필요하면 `wrap({ asyncComponent: () => import('./Page.svelte') })`. 처음 필요할 때 그 페이지의 번들을 불러옵니다.

### A vs B

| | A. 직접 만든 라우터 | B. svelte-spa-router |
|---|---|---|
| 코드량 | 약 80줄 | 라이브러리 사용 (설치 1회) |
| 이해 | 원리가 훤히 보임 | 내부는 블랙박스 |
| 기능 | 필요한 만큼만 | 가드, lazy 로딩, 중첩 라우터, 스크롤 복원 등 |
| 권장 | **학습**, 아주 작은 앱 | **실제 SPA** |

---

## 4. 공유 페이지 (`pages/`)

두 방식이 같은 페이지를 씁니다. 해시 라우팅이라 페이지 안의 링크가 평범한 `<a href="#/users/2">`로 충분하기 때문입니다.

```svelte
<!-- UserDetail.svelte -->
<script>
  let { params = {} } = $props()                          // 라우터가 넘겨 주는 파라미터
  const user = $derived(users.find((u) => u.id === params.id))   // params가 바뀌면 자동 재계산
</script>
```

> `params`가 바뀌어도 **컴포넌트는 다시 만들어지지 않습니다.** (`/users/1` → `/users/2`는 같은 컴포넌트에 prop만 바뀜) 그래서 `params`로 계산하는 값은 반드시 `$derived`로 만들어야 합니다. 한 번만 계산하면 이전 사용자가 화면에 남습니다.

---

## 5. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 SPA | SvelteKit |
|---|---|---|---|---|
| 라우터 | **React Router** | **Vue Router** | svelte-spa-router (또는 직접) | **내장** (파일 기반) |
| 라우트 정의 | `<Route path element>` / 객체 배열 | `routes` 배열 | `{ '/path': Component }` 객체 | `src/routes/users/[id]/+page.svelte` |
| 파라미터 | `useParams()` | `useRoute().params` | `params` prop | `$page.params` / `data` |
| 이동 | `<Link>`, `useNavigate()` | `<RouterLink>`, `router.push` | `<a>`+`use:link`, `push()` | `<a href>` , `goto()` |
| 가드 | `loader`/컴포넌트 안 처리 | `beforeEach` / `beforeEnter` | `wrap({ conditions })` | `+layout.server.js`, hooks |
| 활성 링크 | `<NavLink>` | `router-link-active` | `use:active` | `$page.url.pathname` 비교 |
| 코드 분할 | `React.lazy` | `() => import()` | `wrap({ asyncComponent })` | 자동 |

---

## 6. TypeScript 버전 메모

```ts
// 라우트 한 칸의 모양
export interface Route {
  path: string
  component: Component<any>             // import type { Component } from 'svelte'
  guard?: () => string | null
}
```

```svelte
<script lang="ts">
  import Router, { type RouteDefinition } from 'svelte-spa-router'
  const routes: RouteDefinition = { '/': Home, '/users/:id': UserDetail, '*': NotFound }

  // params도 prop이므로 타입을 적어 준다
  let { params = {} }: { params?: { id?: string } } = $props()
</script>
```

- `matchPath(pattern: string, path: string): Record<string, string> | null` 처럼 **반환 타입에 `null`을 명시**하면 사용하는 쪽이 `if (params)` 검사를 빠뜨리지 못합니다.
- 라우트 파라미터는 항상 **문자열**입니다. 숫자로 쓰려면 `Number(params.id)`로 변환해야 합니다.

---

## 7. 자주 하는 실수

1. **`params`로 계산한 값을 일반 `const`로 선언** → 같은 컴포넌트에서 파라미터만 바뀌면 갱신되지 않음. `$derived`
2. **catch-all(`*`)을 중간에 둠** → 그 뒤 라우트가 전부 가려짐
3. **링크에 `#`을 빠뜨림** (`href="/users"`) → 해시 라우팅이 아니라 실제 페이지 이동. `use:link`를 쓰거나 `#/users`
4. **가드 리다이렉트에 `push` 사용** → 뒤로가기가 다시 가드에 걸려 무한 반복. `replace`
5. **이동을 `$derived` 안에서 실행** → 부수 효과는 `$effect`/이벤트 핸들러에서
6. **히스토리 라우팅으로 배포했는데 새로고침 404** → 서버가 모든 경로를 `index.html`로 돌려야 함 (또는 해시 라우팅)

## 확인 문제

1. 해시 라우팅이 서버 설정 없이도 동작하는 이유는?
2. `/users/1`에서 `/users/2`로 이동할 때 `UserDetail` 컴포넌트는 새로 만들어지는가? 그렇다면/아니라면 코드에서 무엇이 달라지는가?
3. 가드가 `/login`으로 보낼 때 `push` 대신 `replace`를 쓰는 이유는?
4. 로그아웃 후 홈이 아니라 로그인 화면으로 가던 버그는 왜 생겼고 어떻게 해결했는가?
5. `svelte-spa-router`에서 `/users`와 `/users/2` 모두에서 링크를 활성화하려면?

## 직접 해보기

- 사용자 상세 페이지에 `?tab=posts` 쿼리 파라미터를 읽어 탭을 전환하기 (A: `router.query.get('tab')`, B: `router.querystring`을 `URLSearchParams`로)
- 라우트 표에 `/users/:id/edit`를 추가하고, 순서에 따라 매칭이 달라지는 것을 확인하기
- B에서 `UserDetail`을 `wrap({ asyncComponent: () => import(...) })`로 바꾸고 `npm run build` 결과물의 파일 개수 변화를 확인하기
