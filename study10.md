# study10. 고급 기술 구현 5 — 테스트 · 빌드/배포 · SvelteKit 맛보기

> 이전: [study9](./study9.md) — transition · action · 생명주기
> 이번 목표: **만든 것이 계속 잘 동작한다는 걸 자동으로 확인(테스트)하고, 배포용으로 빌드하고, 다음 단계(SvelteKit)가 어떻게 이어지는지 본다.**
> 실습 코드: `src/lessons/study10/` (화면) + **`src/tests/`** (테스트 11개 파일, 58개 테스트)
> 명령어: `npm test` · `npm run test:watch` · `npm run build` · `npm run preview`

---

## 1. 왜 테스트하는가

화면을 눌러 보며 확인하는 것은 **지금 한 번**만 유효합니다. study7에서 만든 라우터는 기능을 하나 고칠 때마다 다른 곳이 깨질 수 있는데, 매번 손으로 모든 화면을 눌러 볼 수는 없습니다.

| 종류 | 확인하는 것 | 이 실습의 예 | 속도 |
|---|---|---|---|
| **단위 테스트** | 함수·클래스 하나 | `matchPath`, `Cart`, `createResource`, 액션 | 매우 빠름 |
| **컴포넌트 테스트** | 화면 조각을 렌더링하고 사용자처럼 조작 | `Counter`, `Stepper`, `TodoList`, `PostManager` | 빠름 |
| **스모크 테스트** | 일단 켜졌는가 | 모든 실습 화면 렌더링 | 빠름 |
| **E2E 테스트** | 진짜 브라우저로 처음부터 끝까지 | (Playwright 등. 이 저장소 범위 밖) | 느림 |

---

## 2. 도구 설치와 설정

```bash
npm install -D vitest jsdom @testing-library/svelte @testing-library/jest-dom @testing-library/user-event
```

| 패키지 | 역할 |
|---|---|
| **Vitest** | 테스트 실행기. Vite와 같은 설정·변환을 써서 `.svelte` 파일을 별도 설정 없이 다룸 |
| **jsdom** | Node.js 안에서 `document`·`window`를 흉내 내는 가짜 브라우저 |
| **@testing-library/svelte** | `render()`, `screen` — 컴포넌트를 화면에 그리고 찾는 도구 |
| **@testing-library/jest-dom** | `toBeInTheDocument()`, `toBeDisabled()`, `toHaveValue()` 같은 DOM 전용 matcher |
| **@testing-library/user-event** | 사용자가 실제로 하는 동작(클릭, 타이핑, Tab)을 재현 |

```js
// vite.config.js
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vitest/config'            // 'vite' 대신 'vitest/config' (test 옵션 타입 포함)

export default defineConfig({
  plugins: [svelte(), svelteTesting()],                  // 테스트 때 브라우저용 Svelte 사용 + 자동 cleanup
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.{test,spec}.js'],
  },
})
```

```json
"scripts": { "test": "vitest run", "test:watch": "vitest" }
```

- `vitest run` : 한 번 실행하고 종료 (CI용). `vitest` : 파일을 저장할 때마다 관련 테스트만 다시 실행 (개발 중).
- `test` 옵션은 `npm test`에만 쓰이고 `npm run dev`·`build`에는 영향이 없습니다. 실제로 `dist/` 결과물에 테스트 코드가 섞이지 않는 것을 확인했습니다.

### jsdom이 흉내 내지 못하는 것 — `setup.js`

jsdom은 브라우저의 **일부**만 구현합니다. 이 실습에서 아래 세 가지가 없어서 직접 채워야 했습니다.

| 없는 API | 쓰는 곳 | 증상 |
|---|---|---|
| `window.matchMedia` | `svelte/motion`의 `prefersReducedMotion` | import 단계에서 `matchMedia is not a function` |
| `ResizeObserver` | `bind:clientWidth` | `ResizeObserver is not defined` |
| `element.animate`, `getAnimations` | `transition:`, `animate:flip` | `getAnimations is not a function` |

`setup.js`에서 **테스트 환경에서만** 가짜를 채워 넣습니다. 실제 브라우저에는 모두 있으므로 앱 코드는 고치지 않습니다.

---

## 3. 단위 테스트

### 3-1. 순수 함수 — 가장 쉽다

```js
import { describe, it, expect } from 'vitest'
import { matchPath } from '../lessons/study7/custom/router.svelte.js'

describe('matchPath', () => {
  it('이름 있는 파라미터를 뽑아낸다', () => {
    expect(matchPath('/users/:id', '/users/3')).toEqual({ id: '3' })
  })
  it('맞지 않으면 null', () => {
    expect(matchPath('/users/:id', '/users')).toBeNull()
  })
})
```

`describe`는 묶음, `it`은 하나의 시나리오, `expect(실제).matcher(기대)`가 검증입니다. 입력 → 출력만 보면 되므로 **로직은 가능하면 순수 함수로 분리**해 두는 것이 테스트하기 좋은 설계입니다.

### 3-2. 룬을 쓰는 클래스 — 파일 이름 규칙

```js
// cart.svelte.test.js   ← .svelte. 가 이름에 있으면 테스트 파일 안에서도 룬을 쓸 수 있다
import { Cart } from '../lessons/study6/lib/cart.svelte.js'

it('상품을 담으면 개수와 합계가 계산된다', () => {
  const cart = new Cart()
  cart.add(mouse); cart.add(mouse); cart.add(keyboard)
  expect(cart.count).toBe(3)
  expect(cart.total).toBe(30000 * 2 + 90000)
})
```

`$state`/`$derived`는 컴포넌트 밖에서도 값을 읽고 쓸 수 있어서, `Cart` 같은 클래스는 **화면 없이** 테스트할 수 있습니다. (이게 study6에서 로직을 `.svelte.js`로 뺀 보람입니다)

- 테스트끼리 영향을 주지 않도록 `setup.js`의 `afterEach`에서 `localStorage.clear()`를 합니다.
- "저장된 값이 깨진 JSON이어도 빈 장바구니로 시작" 같은 **실패 경로**도 테스트합니다.

### 3-3. 비동기 + "응답 시점을 내가 정하기" — `deferred`

```js
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

it('늦게 도착한 옛 응답은 무시한다', async () => {
  const slow = deferred(), fast = deferred()
  const r = createResource((which) => (which === 'slow' ? slow.promise : fast.promise))

  const first = r.load('slow')
  const second = r.load('fast')            // 두 번째 요청이 첫 요청을 abort

  fast.resolve('빠른 응답'); await second
  slow.resolve('늦게 온 옛 응답'); await first
  expect(r.data).toBe('빠른 응답')          // 덮어쓰이지 않았다
})
```

실제 네트워크에서는 "빠른 응답이 먼저, 느린 응답이 나중에" 도착하는 상황을 일부러 만들기 어렵습니다. `deferred`를 쓰면 **도착 순서를 테스트 코드가 직접 조종**할 수 있습니다. (study8의 경쟁 상태 방지를 확실하게 검증)

시간 자체가 필요할 때는 `vi.useFakeTimers()` + `vi.advanceTimersByTime(500)`으로 **실제로 기다리지 않고** 시계를 돌립니다. (`longpress` 액션 테스트)

---

## 4. 컴포넌트 테스트 (Testing Library)

### 철학: 구현이 아니라 사용자의 눈으로

```js
render(Counter)

await user.click(screen.getByRole('button', { name: '+ 1' }))     // "이름이 '+ 1'인 버튼"을 눌렀다
expect(screen.getByText('1', { selector: 'strong' })).toBeInTheDocument()   // 화면에 1이 보인다
```

- 변수 이름(`count`)이나 내부 상태를 확인하지 **않습니다.** 사용자가 보는 글자·역할(role)·label로 요소를 찾습니다. 그래서 내부 구현을 리팩터링해도(변수명 변경, `$derived`로 교체) 테스트가 깨지지 않습니다.
- 찾기 우선순위: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByTestId`(마지막 수단)

### 쿼리 3종 세트

| 접두사 | 없으면 | 용도 |
|---|---|---|
| `getBy…` | 에러 | "있어야 한다" (즉시) |
| `queryBy…` | `null` | "없어야 한다" 확인 — `expect(screen.queryByText('x')).not.toBeInTheDocument()` |
| `findBy…` | 기다리다 에러 | **비동기로 나타나는 것** (API 응답 후 목록) — `await screen.findByText('post 1')` |

여러 개면 `getAllBy…`, 특정 영역 안에서만 찾을 땐 `within(요소).getBy…`.

### props와 콜백 테스트

```js
const onchange = vi.fn()                              // 호출 기록을 남기는 가짜 함수
render(Stepper, { props: { value: 3, min: 1, max: 5, onchange } })

await user.click(screen.getByRole('button', { name: '증가' }))
expect(onchange).toHaveBeenCalledWith(4)              // 자식은 "4로 바꿔 줘"라고 부모에게 요청했다
expect(screen.getByText('3')).toBeInTheDocument()     // 값은 부모가 바꿔 주기 전까지 그대로 (단방향!)

await rerender({ value: 3 })                          // 부모가 props를 바꾸는 상황
```

study3에서 배운 "props 아래로, 콜백 위로"를 그대로 검증합니다.

### 가짜 서버 — `fakeApi.js`

```js
vi.stubGlobal('fetch', vi.fn(async (url, options) => { /* URL과 method로 응답을 돌려줌 */ }))
```

- 진짜 서버를 부르는 테스트는 **느리고, 인터넷이 없으면 실패하고, 결과가 매번 달라질 수 있습니다.**
- 가짜 서버는 요청 기록(`calls`)을 남겨서 "검증 실패 시 POST가 한 번도 나가지 않았다"도 확인할 수 있습니다.
- `AbortSignal`도 지원해서 요청 취소 시나리오를 재현합니다.

### 폼 테스트에서 확인한 시나리오 (`PostManager.test.js`)

1. 처음엔 "불러오는 중" → 목록 5개
2. 빈 입력 제출 → 오류 2개 표시, **POST 0회**
3. 입력칸을 벗어나기(`user.tab()`) 전에는 오류 숨김, 벗어난 뒤 표시
4. 올바른 제출 → POST 1회, 목록 맨 앞에 추가, 폼 초기화
5. 삭제 → **응답 전에** 이미 사라짐 (낙관적 업데이트)
6. 삭제 실패 → 되돌려지고 안내 (롤백)
7. 등록 실패 → 오류 표시, 입력 유지, 버튼 복구

---

## 5. 테스트가 정말 문제를 잡는지 확인하기 (변이 확인)

통과하는 테스트가 **항상 옳은 것은 아닙니다.** 아무것도 검증하지 못하는 테스트도 통과합니다. 그래서 이 실습에서는 **코드를 일부러 망가뜨려서 테스트가 실패하는지** 확인했습니다.

| 망가뜨린 곳 | 기대 | 결과 |
|---|---|---|
| `resource`의 `if (mine === controller) data = result` 제거 | "옛 응답 무시" 테스트 실패 | ✅ 실패 |
| `PostManager`의 롤백 줄 제거 | "삭제 실패 시 되돌림" 테스트 실패 | ✅ 실패 |
| 라우터 가드의 경쟁 상태 방지 제거 | "로그아웃 → 홈" 테스트 실패 | ✅ 실패 |
| 라우터의 마운트 시 `router.sync()` 제거 | 전용 테스트 실패 | ❌ **처음엔 통과해 버림** |

마지막 줄이 교훈입니다. "만들어질 때 현재 주소와 맞춘다" 테스트는 **거짓 통과**였습니다. 렌더 직후에 도착한 `hashchange` 이벤트가 어차피 상태를 맞춰 주고 있었기 때문입니다. 이벤트를 먼저 흘려보낸 뒤 렌더하고, **렌더 직후 곧바로** 확인하도록 고치자 변이를 정확히 잡았습니다.

> 방법: 고친 코드 한 줄을 주석 처리 → 테스트 실행 → 실패하는지 확인 → 원복. 새 테스트를 쓸 때 습관으로 삼기 좋습니다.

---

## 6. 테스트를 쓰다 발견한 실제 버그 두 가지

| 발견 | 원인 | 해결 |
|---|---|---|
| 탭 A↔B 전환 후 **주소창과 다른 화면**이 뜸 (study7) | 직접 만든 라우터가 모듈 import 시점에만 주소를 읽고, 안 보이는 동안의 변경은 놓침 | `RouterView`가 만들어질 때 `router.sync()` |
| TS 버전에서만 "취소(AbortError)"가 오류로 표시됨 (study8) | `e instanceof Error`는 `DOMException`이 Error를 상속하지 않는 환경(jsdom)에서 `false` | `name === 'AbortError'`로 환경과 무관하게 판별 |

둘 다 "손으로 눌러 볼 때는 안 걸리는" 종류입니다. 테스트가 **시나리오를 강제로 만들어 주기 때문에** 드러났습니다.

---

## 7. 스모크 테스트

```js
it.each(lessons.map((l) => [l.id, l]))('%s 이(가) 오류 없이 렌더링된다', (_id, lesson) => {
  const { container } = render(lesson.component)
  expect(container.querySelector('h2')).not.toBeNull()
})
```

`lessons` 배열을 순회하며 모든 실습 화면을 렌더링합니다. 새 study를 추가하면 **테스트를 따로 쓰지 않아도 자동으로 포함**됩니다. 잘못된 import, 초기화 중 예외 같은 큰 사고를 가장 싸게 잡습니다.

---

## 8. 빌드와 배포

```bash
npm run build      # dist/ 생성 (코드 압축, 안 쓰는 코드 제거)
npm run preview    # dist/ 를 로컬 서버로 미리보기 → 배포와 가장 비슷한 환경
```

```
dist/index.html
dist/assets/index-xxxx.css      ← 10 kB (gzip 2.5 kB)
dist/assets/index-xxxx.js       ← 140 kB (gzip 52 kB)   ← study1~10 실습 전체 + 라우터 라이브러리
```

- 파일 이름에 붙은 해시(`xxxx`)는 내용이 바뀌면 달라집니다 → 브라우저 캐시를 안전하게 쓸 수 있습니다.
- 가상 DOM 런타임이 없어서 모든 실습을 합쳐도 gzip 52 kB입니다. (Svelte 컴파일 방식의 장점)

### 환경 변수 `.env`

```
# .env
VITE_APP_TITLE=Svelte 학습 (JS)
```

```js
import.meta.env.VITE_APP_TITLE     // 'Svelte 학습 (JS)'
import.meta.env.MODE               // 'development' | 'production' | 'test'
import.meta.env.DEV / PROD         // boolean
import.meta.env.BASE_URL           // '/'
```

- **`VITE_` 로 시작하는 변수만** 브라우저 코드에 노출됩니다.
- 값은 빌드할 때 **글자 그대로 코드에 박힙니다.** 브라우저로 내려가는 파일이므로 API 비밀키, 비밀번호는 절대 넣지 않습니다. (비밀은 서버에서만)
- 파일 종류: `.env`(공통) · `.env.development` · `.env.production` · `.env.local`(git 제외, 내 PC 전용).
- 실습의 **BuildInfo** 화면에서 `npm run dev`와 `npm run preview`의 MODE 차이를 볼 수 있고, 테스트에서는 MODE가 `test`로 나옵니다.

### 어디에 배포하나

| 방식 | 설명 | 라우팅 |
|---|---|---|
| 정적 호스팅 (GitHub Pages, Netlify, Vercel, Cloudflare Pages) | `dist/` 폴더를 올리면 끝 | **해시 라우팅은 설정 불필요.** 히스토리 라우팅은 "모든 경로 → index.html" 규칙 필요 |
| 하위 경로 배포 (`user.github.io/repo/`) | `vite.config`에 `base: '/repo/'` 또는 `'./'` | 해시 라우팅은 영향 적음 |

---

## 9. SvelteKit 맛보기 — 다음 단계

지금까지의 Vite SPA는 **브라우저에서만** 동작합니다. SvelteKit은 같은 `.svelte` 문법 위에 **라우팅 · 서버 렌더링 · 서버 코드**를 더한 풀스택 프레임워크입니다. (React의 Next.js, Vue의 Nuxt에 해당)

```bash
npx sv create my-kit-app      # 공식 CLI로 SvelteKit 프로젝트 생성
```

> 이 문서를 쓸 때 직접 만들어 본 최신 minimal 템플릿(SvelteKit 3)에서는 `svelte.config.js` 없이 `vite.config.ts` 안의 `sveltekit({ ... })` 플러그인에 옵션을 둡니다. 버전에 따라 설정 파일 위치가 달라질 수 있으니 생성된 프로젝트의 파일을 먼저 확인하세요.

### 파일이 곧 라우트

```
src/routes/
├─ +layout.svelte              ← 모든 페이지를 감싸는 공통 틀 (children을 렌더링)
├─ +page.svelte                ←  /
├─ users/
│  └─ [id]/
│     ├─ +page.js              ←  /users/2 의 load()  (데이터 준비)
│     └─ +page.svelte          ←  /users/2 화면
└─ contact/
   ├─ +page.server.js          ←  서버에서만 실행: form actions
   └─ +page.svelte
```

### 데이터 불러오기 — `load()`

```js
// src/routes/users/[id]/+page.js
import { error } from '@sveltejs/kit'

export async function load({ params, fetch }) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${params.id}`)
  if (!res.ok) error(404, '사용자를 찾을 수 없습니다')
  return { user: await res.json() }
}
```

```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props()          // load()가 돌려준 값이 data로 들어온다
</script>
<h1>{data.user.name}</h1>
```

직접 확인한 결과:

- `/users/1` 을 요청하면 **서버가 HTML을 완성해서 응답**합니다. (`<h1>Leanne Graham</h1>` 이 첫 응답에 이미 들어 있음 → SSR. 검색엔진·느린 기기에 유리)
- `/users/9999` 는 `error(404, …)` 때문에 **HTTP 404** 로 응답합니다.
- study8에서 `onMount` + `createResource`로 직접 만든 "로딩/오류/데이터" 처리를 `load()`가 대신해 줍니다.

### 폼 — `actions` 와 `use:enhance`

```js
// src/routes/contact/+page.server.js  (서버에서만 실행)
import { fail } from '@sveltejs/kit'

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData()
    const message = String(form.get('message') ?? '').trim()
    if (message.length < 5) return fail(400, { message, error: '5자 이상 입력하세요.' })
    return { success: true }
  },
}
```

```svelte
<script>
  import { enhance } from '$app/forms'
  let { form } = $props()                      // 액션이 돌려준 값
</script>
<form method="POST" use:enhance>
  <textarea name="message" value={form?.message ?? ''}></textarea>
  <button>보내기</button>
</form>
{#if form?.error}<p>{form.error}</p>{/if}
```

- 직접 확인: 짧은 글은 **HTTP 400**, 정상 입력은 **HTTP 200**.
- `use:enhance`가 없어도 `<form method="POST">`만으로 동작합니다. (JS가 꺼져 있어도 됨 = 점진적 향상) `use:enhance`는 페이지 새로고침 없이 처리하도록 **더해 주는** 기능입니다.
- 검증을 **서버에서** 한다는 점이 중요합니다. 브라우저의 검증(study8)은 편의일 뿐 믿을 수 없습니다.

### SPA ↔ SvelteKit 대응표 (study10 실습 화면에도 있음)

| 지금까지 (SPA) | SvelteKit |
|---|---|
| 해시 라우터 `#/users/2` | 파일 기반 라우팅 `src/routes/users/[id]/+page.svelte` |
| `onMount` 안의 `fetch` | `+page.js` / `+page.server.js`의 `load()` |
| `bind:value` + `fetch POST` | form `actions` + `use:enhance` |
| `wrap({ conditions })` 가드 | `hooks.server.js` / `+layout.server.js`에서 검사 |
| `.svelte.js` 전역 상태 | context 또는 `data` (SSR에서는 전역 변수 공유 주의 — study6) |
| JSONPlaceholder 호출 | `+server.js` 로 우리 API를 직접 작성 |
| `npm run build` → `dist/` | adapter 선택 (static / node / vercel / cloudflare …) |

---

## 10. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 테스트 실행기 | Jest / **Vitest** | **Vitest** | **Vitest** |
| 컴포넌트 테스트 | React Testing Library | Vue Test Utils / Testing Library | **Testing Library (Svelte)** |
| 사용자 동작 | user-event | user-event / `trigger` | user-event |
| 로직 단위 테스트 | Hook은 `renderHook` 필요 | Composable은 앱 컨텍스트 필요할 수 있음 | `.svelte.js` 함수·클래스를 **그냥 호출** |
| 풀스택 | Next.js / Remix | Nuxt | **SvelteKit** |
| 데이터 로딩 | Server Components, loader | `useAsyncData` | `load()` |
| 서버 폼 처리 | Server Actions | 직접 API | **form actions** |
| 환경 변수 | `NEXT_PUBLIC_*` / `VITE_*` | `VITE_*` | `VITE_*` (SvelteKit은 `$env/*` 모듈도 제공) |

---

## 11. TypeScript 버전 메모

```ts
// 타입이 있는 deferred
function deferred<T = unknown>() {
  let resolve!: (value: T) => void              // ! : "곧 할당된다"고 컴파일러에 알림
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}
```

```ts
// 브라우저 API를 흉내 낼 때는 as unknown as 로 타입을 맞춘다
window.matchMedia = ((query: string) => ({ matches: false, media: query, /* ... */ })) as unknown as typeof window.matchMedia
```

```ts
// src/env.d.ts — .env 변수 타입 선언
interface ImportMetaEnv { readonly VITE_APP_TITLE?: string }
```

```ts
// catch (e) 의 e는 unknown. instanceof Error 대신 환경에 덜 의존적인 판별 사용
function isAbortError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && e.name === 'AbortError'
}
```

- 테스트 코드도 타입 검사 대상입니다. `npm run check` 가 `src/tests/*.ts`까지 검사합니다. (이 과정에서 `calls` 배열 타입, `deferred` 제네릭 등을 바로잡음)
- `@testing-library/jest-dom/vitest`를 `setup.ts`에서 import하면 `toBeInTheDocument()` 등 matcher의 **타입도 함께** 등록됩니다.

---

## 12. 자주 하는 실수

1. **테스트가 항상 통과** → 아무것도 검증하지 않을 수 있음. 코드를 일부러 망가뜨려 실패하는지 확인
2. **`getByText`로 비동기 결과를 즉시 찾음** → `await findByText` 사용
3. **`userEvent` 호출에 `await` 누락** → 다음 줄이 동작 전에 실행됨
4. **진짜 서버·진짜 시간에 의존** → `vi.stubGlobal('fetch')`, `vi.useFakeTimers()`
5. **내부 상태·변수명을 검증** → 리팩터링할 때마다 테스트가 깨짐. 화면에 보이는 결과를 검증
6. **테스트 사이 상태 공유** (모듈 싱글톤, localStorage, `location.hash`) → `afterEach`에서 초기화
7. **`.env`에 비밀 값 저장** → 빌드 결과물에 평문으로 노출됨
8. **jsdom에서 안 되는 API를 앱 코드 탓으로 착각** → 폴리필은 테스트 `setup`에서

## 확인 문제

1. 컴포넌트 테스트에서 `getByRole`을 `getByTestId`보다 먼저 쓰는 이유는?
2. `getBy…`, `queryBy…`, `findBy…`는 각각 언제 쓰는가?
3. `deferred` Promise가 필요한 이유를 "요청 취소(study8)"와 연결해 설명하라.
4. 변이 확인(코드를 망가뜨려 테스트 실패 확인)은 왜 필요한가? 이 실습에서 거짓 통과했던 테스트는 무엇이었고 어떻게 고쳤는가?
5. `VITE_` 접두사가 없는 환경 변수와, 있는 변수의 차이는? 비밀 값을 `.env`에 넣으면 안 되는 이유는?
6. SvelteKit의 `load()`는 study8의 `onMount + fetch`와 무엇이 다른가?

## 직접 해보기

- `npm run test:watch`를 켜 둔 채 `Stepper.svelte`의 `max` 조건을 일부러 틀리게 고쳐서 어떤 테스트가 실패하는지 보기
- `SearchList`(study4)의 필터·정렬에 대한 컴포넌트 테스트 추가하기
- `npm run build && npm run preview` 후 BuildInfo 화면의 MODE가 `production`인지 확인하기
- `npx sv create`로 SvelteKit 프로젝트를 만들어 `src/routes/users/[id]/+page.svelte`를 직접 구현해 보기 (studyFinal 이후의 과제)
