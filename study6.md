# study6. 고급 기술 구현 1 — 공유 상태 (`.svelte.js` · class · context · store)

> 이전: [study5](./study5.md) — 컴포넌트 합성
> 이번 목표: **여러 컴포넌트가 같은 상태를 보게 만든다.** props를 일일이 내려 주지 않고도.
> 실습 코드: `src/lessons/study6/` (`lib/` 폴더에 상태 모듈)
> 파일: `CounterDemo` · `CartDemo` · `ContextDemo` (`ThemeProvider` · `ThemeToggle` · `ThemeLabel`) · `StoreDemo` · `SetDemo`
> 모듈: `lib/counter.svelte.js` · `lib/cart.svelte.js` · `lib/persisted.svelte.js` · `lib/theme.svelte.js` · `lib/notify.js`

---

## 1. 왜 필요한가 — props의 한계

```
App
├─ Header ── 장바구니 개수 표시   ┐
├─ ProductList ── "담기" 버튼     ├─ 모두 같은 장바구니 상태가 필요
└─ Sidebar ── 장바구니 합계       ┘
```

상태를 가장 가까운 공통 부모에 올려서 props로 내려 주는 방식(**상태 끌어올리기**)은 컴포넌트가 깊어질수록 중간 컴포넌트가 쓰지도 않는 props를 전달만 하게 됩니다. (**prop drilling**)

Svelte 5에서는 룬이 **컴포넌트 밖의 파일**(`.svelte.js` / `.svelte.ts`)에서도 동작하므로, 상태를 모듈로 빼서 필요한 곳에서 import하면 됩니다.

---

## 2. `.svelte.js` 파일 — 컴포넌트 밖의 반응형

```js
// lib/counter.svelte.js   ← 파일 이름에 .svelte 가 들어가야 룬을 쓸 수 있다
export const counter = $state({ count: 0 })

export function increment() { counter.count++ }
```

```svelte
<script>
  import { counter, increment } from './lib/counter.svelte.js'
</script>
<button onclick={increment}>{counter.count}</button>
```

두 컴포넌트가 같은 모듈을 import하면 **같은 `counter` 객체**를 읽으므로, 한쪽에서 바꾸면 다른 쪽도 즉시 갱신됩니다.

### 꼭 지켜야 할 규칙: 객체로 내보낸다

```js
// ❌ 컴파일 에러 (state_invalid_export)
export let count = $state(0)
count++      // 재할당하는 순간, import한 쪽은 값의 복사본만 받게 된다

// ✅ 객체의 속성을 바꾼다
export const counter = $state({ count: 0 })
counter.count++
```

숫자·문자열 같은 원시값은 변수를 내보내면 **값이 복사**되어 반응성이 사라집니다. 객체(혹은 아래의 getter)로 감싸서 내보내세요.

### 팩토리 함수 + getter

```js
export function createCounter(initial = 0) {
  let count = $state(initial)
  const double = $derived(count * 2)
  return {
    get count() { return count },        // 읽을 때마다 현재 값을 돌려준다
    get double() { return double },
    increment() { count++ },
  }
}

const mine = createCounter(10)    // 호출할 때마다 독립적인 상태
```

- 반환 객체의 `count: count`처럼 값을 직접 넣으면 그 순간 복사됩니다. **`get` 접근자**를 써야 읽는 시점마다 최신 값이 나옵니다.
- 싱글톤(앱 전체 공유)이 필요하면 모듈 변수, 인스턴스마다 따로 필요하면 팩토리.

---

## 3. 클래스 + 룬 — 장바구니 스토어

```js
// lib/cart.svelte.js
export class Cart {
  items = $state([])
  count = $derived(this.items.reduce((sum, it) => sum + it.qty, 0))
  total = $derived(this.items.reduce((sum, it) => sum + it.price * it.qty, 0))

  add(product) {
    const found = this.items.find((it) => it.id === product.id)
    if (found) found.qty++
    else this.items.push({ ...product, qty: 1 })
    this.#save()
  }
  #save() { localStorage.setItem(KEY, JSON.stringify($state.snapshot(this.items))) }
}

export const cart = new Cart()        // 앱 전체가 공유하는 인스턴스
```

- **클래스 필드에 `$state`와 `$derived`를 그대로** 쓸 수 있습니다.
- "상태 + 파생값 + 상태를 바꾸는 규칙(메서드)"이 한곳에 모여 컴포넌트가 단순해집니다. 컴포넌트는 `cart.add(p)`, `cart.total`만 쓰면 됩니다.
- `#save`는 JS의 **private 메서드**입니다. 바깥에서 부르지 못하게 감춥니다.
- 저장할 때 `$state.snapshot(...)`으로 Proxy를 일반 객체로 만든 뒤 `JSON.stringify`합니다.

### 저장 헬퍼 `persisted`

```js
const theme = persisted('theme', 'light')
theme.value = 'dark'        // 상태도 바뀌고 localStorage에도 저장
```

`localStorage`는 사생활 보호 모드나 차단 환경에서 예외가 날 수 있어서 **항상 `try/catch`로 감싸고**, 읽을 때는 기본값을 돌려줍니다.

---

## 4. context — 트리를 따라 아래로 전달

모듈 상태는 "앱 전체에서 하나"입니다. 반면 **특정 영역(Provider 아래)에만 적용되는 값**이 필요할 때는 context를 씁니다.

```js
// lib/theme.svelte.js
import { getContext, setContext } from 'svelte'
const KEY = Symbol('theme')                 // Symbol key → 다른 key와 절대 충돌하지 않음

export function provideTheme() {
  const theme = persisted('theme', 'light')
  const api = { get mode() { return theme.value }, toggle() { ... } }
  setContext(KEY, api)
  return api
}
export function useTheme() {
  return getContext(KEY)
}
```

```svelte
<!-- ThemeProvider.svelte -->
<script>
  const theme = provideTheme()      // 이 컴포넌트가 만들어질 때 context에 등록
</script>
<div data-theme={theme.mode}>{@render children?.()}</div>

<!-- 깊이 중첩된 자손: ThemeToggle.svelte -->
<script>
  const theme = useTheme()          // props 없이 가장 가까운 Provider에서 꺼냄
</script>
<button onclick={theme.toggle}>{theme.mode}</button>
```

### 규칙과 주의

- `setContext` / `getContext`는 **컴포넌트 초기화 중**(`<script>` 최상위)에만 호출할 수 있습니다. 이벤트 핸들러나 `$effect` 안에서는 불가.
- context 자체는 반응형이 아닙니다. **반응형 객체(getter가 있는 객체, `$state` 객체)를 context에 넣으면** 자손에서도 반응합니다. 위 예의 `get mode()`가 그 역할입니다.
- `useTheme()`처럼 **함수로 감싸서** 쓰면 key를 숨기고 "Provider 밖에서 호출했을 때" 친절한 에러를 줄 수 있습니다.
- (참고) 최신 Svelte 5에는 `createContext()` 헬퍼가 있어서 `setContext/getContext` 쌍을 타입 안전하게 만들 수 있습니다.

### 모듈 상태 vs context

| | 모듈 상태 | context |
|---|---|---|
| 범위 | 앱 전체에 하나 | Provider 아래 서브트리마다 별도 |
| 같은 값을 쓰는 곳 | 어디서든 import | 자손 컴포넌트만 |
| 테스트·여러 인스턴스 | 어려움 (전역) | 쉬움 (Provider마다 새로 생성) |
| **SSR (SvelteKit)** | **서버에서 요청 간에 공유될 위험** | 요청별로 안전 |

> SvelteKit으로 서버 렌더링을 할 때는 모듈 변수가 **서버 프로세스 전체에서 공유**되어 사용자 간 데이터가 섞일 수 있습니다. 사용자별 상태는 context나 `locals`로 다룹니다. 지금 같은 SPA(브라우저 전용)에서는 문제가 없습니다.

---

## 5. 기존 스토어 `svelte/store` (`$store` 문법)

Svelte 3·4 시절의 방식이며 Svelte 5에서도 그대로 동작합니다. 예제와 라이브러리에서 자주 만나므로 읽을 줄은 알아야 합니다.

```js
// lib/notify.js  (룬을 쓰지 않는 일반 .js)
import { writable, derived } from 'svelte/store'

export const messages = writable([])
export const messageCount = derived(messages, ($m) => $m.length)
export const notify = (text) => messages.update((list) => [...list, { id: nextId++, text }])
```

```svelte
<script>
  import { messages, messageCount } from './lib/notify.js'
</script>
<p>알림 {$messageCount}개</p>                 <!-- $ 접두사: 자동 구독 + 컴포넌트가 사라지면 자동 해제 -->
{#each $messages as m}<li>{m.text}</li>{/each}
```

| API | 의미 |
|---|---|
| `writable(초기값)` | 읽고 쓸 수 있는 스토어. `.set()`, `.update(fn)`, `.subscribe(fn)` |
| `readable(초기값, start)` | 읽기 전용 (타이머·WebSocket 같은 외부 소스 연결에 사용) |
| `derived(스토어, fn)` | 다른 스토어로 계산 |
| `$이름` | 컴포넌트 안에서 값 읽기/쓰기(`$count = 5`) 를 자동 구독으로 처리 |
| `get(store)` | 컴포넌트 밖에서 한 번 읽기 |

**권장 정리**: 새 코드는 `.svelte.js` + 룬 → 기존 스토어 기반 코드와 연동할 때만 `svelte/store`.

---

## 6. 반응형 내장 객체 — `svelte/reactivity`

`$state`는 객체/배열의 안쪽을 추적하지만 `Set`, `Map`, `Date`, `URL`의 **내부 변경**은 추적하지 못합니다. 이를 대신하는 클래스가 있습니다.

```js
import { SvelteSet, SvelteMap, SvelteDate, SvelteURL } from 'svelte/reactivity'

const selected = new SvelteSet(['Svelte'])
selected.add('Vue')           // 화면 자동 갱신
selected.has('Vue')           // true  (읽는 곳도 반응)
```

선택된 항목 집합(체크 목록, 태그)이나 키-값 캐시에 유용합니다.

---

## 7. 무엇을 쓸까 — 선택 기준

| 상황 | 추천 |
|---|---|
| 부모-자식 한두 단계 | **props** |
| 부모 ↔ 입력용 자식 | `bind:` + `$bindable` |
| 앱 전체에서 하나만 (장바구니, 로그인 사용자) | **`.svelte.js` 모듈 상태** (클래스 또는 객체) |
| 특정 영역 아래에서만 (테마, 폼 그룹, 탭 그룹) | **context** |
| 같은 로직을 여러 인스턴스에서 따로 | **팩토리 함수** |
| 기존 스토어 기반 라이브러리와 연동 | `svelte/store` |

---

## 8. Vue / React와 비교

| 용도 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 앱 전역 상태 | Redux / Zustand / Context+Reducer | **Pinia** | `.svelte.js` 모듈 + 룬 (별도 라이브러리 불필요) |
| 영역별 전달 | `createContext` + `useContext` | `provide` / `inject` | `setContext` / `getContext` |
| 로직 재사용 | Custom Hook (`useXxx`) | Composable (`useXxx`) | 팩토리 함수 / `.svelte.js` (`createXxx`) |
| 로컬스토리지 연동 | 직접 `useEffect` | `@vueuse/core` 등 | `persisted` 같은 작은 헬퍼 |
| 파생 값 | selector / `useMemo` | `getters` / `computed` | `$derived` |

> React의 Custom Hook과 Vue의 Composable에 해당하는 것이 Svelte 5의 `.svelte.js` 함수입니다.
> 다만 Hook의 "호출 순서 규칙" 같은 제약이 없습니다. 컴포넌트 함수가 한 번만 실행되기 때문입니다.

---

## 9. TypeScript 버전 메모

```ts
// lib/persisted.svelte.ts — 제네릭으로 저장 타입을 보존
export function persisted<T>(key: string, initial: T) {
  let value = $state<T>(read(key, initial))
  return { get value() { return value }, set value(next: T) { value = next; write(key, next) } }
}
const theme = persisted<'light' | 'dark'>('theme', 'light')    // theme.value는 'light' | 'dark'
```

```ts
// context도 인터페이스로 계약을 명시
export interface ThemeContext { readonly mode: ThemeMode; toggle(): void }
const theme = getContext<ThemeContext | undefined>(KEY)
```

- `.svelte.ts` 파일도 `.svelte.js`로 import합니다: `import { cart } from './lib/cart.svelte.js'`
- `import { cart, type Product } from ...` : 값과 타입을 한 줄로 가져올 수 있습니다.
- 클래스 필드 `items = $state<CartItem[]>(...)` 처럼 필드 타입도 제네릭으로 지정합니다.

---

## 10. 자주 하는 실수

1. **파일 이름이 `.js`/`.ts`** → 룬을 쓰려면 반드시 `.svelte.js` / `.svelte.ts`
2. **`export let x = $state(0)` + 재할당** → 컴파일 에러. 객체로 감싸기
3. **반환 객체에 값을 직접 넣음** (`{ count }`) → 복사됨. `get count()` 사용
4. **`setContext`/`getContext`를 이벤트 핸들러에서 호출** → 컴포넌트 초기화 중에만 가능
5. **스토어를 컴포넌트 `<script>`에서 `$store` 대신 `store`로 읽음** → 값이 아니라 스토어 객체가 나옴
6. **`$state.snapshot` 없이 `JSON.stringify(proxy)`** → 동작은 하지만 Proxy 사본 문제를 피하려면 snapshot이 안전

## 확인 문제

1. `export let count = $state(0)`는 왜 에러가 나는가? 어떻게 고치는가?
2. 모듈 상태와 context는 각각 어떤 상황에 쓰는가? SSR 관점에서 차이는?
3. 팩토리 함수가 반환하는 객체에서 `get count()`를 쓰는 이유는?
4. `$messages`에서 `$`는 무슨 일을 해 주는가?
5. `SvelteSet`이 필요한 이유는? 그냥 `$state(new Set())`이면 안 되는가?

## 직접 해보기

- `cart`에 "쿠폰 코드" 기능을 추가: `discount = $state(0)`, `payable = $derived(total - discount)`
- `persisted`를 사용해 `study2`의 `title` 입력값을 새로고침해도 유지하게 만들기
- `ThemeProvider`를 두 개 놓고 서로 다른 테마가 독립적으로 유지되는지 확인 (context는 서브트리별 독립)
