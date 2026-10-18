# study2. 실습2 — 반응형 (`$state`, `$derived`, `$effect`)

> 이전: [study1](./study1.md) — 프로젝트 생성, 첫 컴포넌트
> 이번 목표: **"상태가 바뀌면 화면이 바뀐다"를 Svelte 5의 룬으로 직접 만든다.**
> 실습 코드: `src/lessons/study2/` (JS_study/demo, TS_study/demo)
> 파일: `Counter.svelte` · `DeepState.svelte` · `Derived.svelte` · `Effect.svelte` · `Lesson.svelte`

---

## 1. 일반 변수는 왜 안 되는가

```svelte
<script>
  let count = 0
</script>
<button onclick={() => count++}>{count}</button>   <!-- 눌러도 화면은 그대로 -->
```

`count`는 값이 바뀌지만 Svelte는 "이 변수를 화면과 연결해도 된다"는 신호를 받지 못했습니다.
**`$state`로 선언한 변수만** 컴파일러가 추적 대상으로 삼습니다.

---

## 2. `$state` — 반응형 상태

```svelte
<script>
  let count = $state(0)
</script>
<button onclick={() => count++}>{count}</button>
```

- 읽을 때도, 바꿀 때도 **그냥 변수처럼** 씁니다. `count++`, `count = 5`, `count += step` 모두 됩니다.
- React의 `const [count, setCount] = useState(0)` + `setCount(c => c + 1)` 과정이 필요 없습니다.
- `$state`는 import하지 않는 **룬**입니다. `.svelte` 파일(그리고 `.svelte.js/.ts` 파일) 안에서만 동작합니다.

### 이벤트 핸들러

```svelte
<button onclick={increase}>+</button>                 <!-- 함수 이름 전달 -->
<button onclick={() => (count -= step)}>-</button>    <!-- 인라인 화살표 함수 -->
```

Svelte 5에서는 `on:click`이 아니라 **`onclick`** 입니다. (일반 HTML 속성과 같은 형태)
`onclick={increase()}`처럼 **호출해서 넘기면 안 됩니다.** 렌더링 시점에 바로 실행되어 버립니다.

### 입력창 읽기

```svelte
<input value={step} oninput={(e) => (step = Number(e.currentTarget.value) || 1)} />
```

`e.currentTarget`은 이벤트가 붙은 요소(여기서는 input)입니다. 더 간단한 `bind:value`는 study3에서 배웁니다.

---

## 3. 객체·배열은 "깊은 반응형"

```js
let user = $state({ name: '홍길동', age: 20 })
let fruits = $state(['사과', '바나나'])

user.age++              // 속성 변경 → 화면 갱신
fruits.push('딸기')      // push → 화면 갱신
fruits.splice(i, 1)     // 삭제 → 화면 갱신
fruits.sort()           // 제자리 정렬 → 화면 갱신
```

- `$state`에 객체/배열을 넣으면 Svelte가 **Proxy**로 감싸서 내부 변경까지 추적합니다.
- **React와 가장 다른 지점**입니다. React는 `setFruits([...fruits, '딸기'])`처럼 새 배열을 만들어야 하고, 같은 배열을 `push`하면 화면이 안 바뀝니다.

### 알아 둘 점

| 상황 | 설명 |
|---|---|
| `console.log(user)` | Proxy가 찍혀서 읽기 불편 → `console.log($state.snapshot(user))` |
| 구조 분해 `let { age } = user` | 그 순간의 값이 **복사**되어 이후엔 반응하지 않음. 필요할 때마다 `user.age`로 읽기 |
| 아주 큰 배열/객체 | 깊은 추적이 부담이면 `$state.raw(값)` — 통째로 교체(`list = [...]`)할 때만 반응 |
| 클래스 인스턴스 | Proxy로 감싸지지 않음. 클래스 필드에 `$state`를 쓰는 방법은 study6 |

---

## 4. `$derived` — 파생 값

```js
let items = $state([...])

const total = $derived(items.reduce((sum, it) => sum + it.price * it.qty, 0))
const count = $derived(items.length)
```

- **다른 상태로부터 계산되는 값**입니다. `items`가 바뀌면 `total`이 자동으로 다시 계산됩니다.
- 의존성 목록을 **적지 않습니다.** 식 안에서 읽은 상태를 컴파일러/런타임이 알아서 추적합니다.
- 계산 결과이므로 직접 대입하지 않습니다. 값이 틀렸다면 원본 상태를 고칩니다.

### 여러 줄이 필요하면 `$derived.by`

```js
const expensive = $derived.by(() => {
  const list = items.filter((it) => it.price >= minPrice)
  return list.map((it) => it.name).join(', ') || '(없음)'
})
```

`$derived(식)` 은 `$derived.by(() => 식)` 의 축약형입니다.

### `$derived`를 쓸 자리에 `$effect`를 쓰지 말 것

```js
// ❌ 나쁜 예 : effect로 상태를 또 다른 상태에 복사
let total = $state(0)
$effect(() => { total = items.reduce(...) })

// ✅ 좋은 예
const total = $derived(items.reduce(...))
```

"A로 B를 계산해서 화면에 보인다" → 항상 `$derived`.

---

## 5. `$effect` — 부수 효과

```js
$effect(() => {
  if (!running) return
  const id = setInterval(() => seconds++, 1000)
  return () => clearInterval(id)     // cleanup
})
```

- 안에서 **읽은 상태가 바뀔 때마다** 다시 실행됩니다. (`running`이 바뀌면 재실행)
- DOM이 갱신된 **뒤**에 실행됩니다. 그래서 DOM을 직접 만지거나, 브라우저 API와 동기화할 때 씁니다.
- **return한 함수는 cleanup**입니다. 다음 실행 직전과 컴포넌트가 사라질 때 호출되어 타이머·이벤트 리스너를 정리합니다.
- 실습에서 "타이머 컴포넌트 보이기" 체크를 끄면 cleanup으로 `setInterval`이 정리됩니다.

### `$effect`를 쓰는 전형적인 경우

| 용도 | 예 |
|---|---|
| 브라우저 API 동기화 | `document.title = ...`, `localStorage.setItem(...)` |
| 타이머/구독 | `setInterval`, WebSocket, `addEventListener` (cleanup 필수) |
| 외부 라이브러리 연결 | 차트, 지도 초기화 |

### `$inspect` — 개발 중 디버깅

```js
$inspect(seconds)    // seconds가 바뀔 때마다 콘솔에 출력. 프로덕션 빌드에서는 제거됨
```

---

## 6. 한눈에 정리

| 하고 싶은 것 | 사용 | 한 줄 요약 |
|---|---|---|
| 바뀌는 값 | `$state` | 이 변수가 바뀌면 화면도 바뀐다 |
| 다른 값으로 계산되는 값 | `$derived` / `$derived.by` | 계산식만 적으면 의존성은 자동 |
| 값이 바뀔 때 바깥 세계에 영향 | `$effect` | DOM 갱신 후 실행, return으로 정리 |
| 디버깅 | `$inspect`, `$state.snapshot` | 값 추적 / Proxy 벗기기 |

---

## 7. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 상태 선언 | `const [n, setN] = useState(0)` | `const n = ref(0)` | `let n = $state(0)` |
| 값 읽기/쓰기 | `n` / `setN(n + 1)` | `n.value` / `n.value++` | `n` / `n++` |
| 객체 내부 변경 | 새 객체로 교체해야 함 | `reactive`면 직접 변경 | 직접 변경 (Proxy) |
| 파생 값 | `useMemo(() => ..., [deps])` | `computed(() => ...)` | `$derived(...)` |
| 부수 효과 | `useEffect(() => {...}, [deps])` | `watchEffect` / `watch` | `$effect(() => {...})` |
| 의존성 지정 | **직접** 배열에 적음 | `watch`는 직접, `computed`는 자동 | **자동** |
| 정리(cleanup) | effect에서 함수 return | `onWatcherCleanup` / `onUnmounted` | effect에서 함수 return |

> React는 상태가 바뀌면 **함수 컴포넌트 전체가 다시 실행**되므로 의존성 배열과 `useMemo`가 필요합니다.
> Svelte는 컴포넌트 `<script>`가 **한 번만** 실행되고, `$derived`/`$effect`/템플릿이 "구독"처럼 연결됩니다.

---

## 8. TypeScript 버전 메모

```ts
interface User { name: string; age: number }
let user = $state<User>({ name: '홍길동', age: 20 })
let fruits = $state<string[]>(['사과', '바나나'])     // 빈 배열은 제네릭으로 타입 지정
const won = (n: number): string => n.toLocaleString('ko-KR') + '원'
```

- 초기값에서 타입이 추론되면 `$state(0)`처럼 그대로 둬도 됩니다.
- 템플릿 안의 화살표 함수도 `lang="ts"`면 타입 검사를 받고, `e.currentTarget`은 해당 요소 타입(`HTMLInputElement`)으로 추론됩니다.

---

## 9. 자주 하는 실수

1. **`$state` 없이 `let`만 선언** → 값은 바뀌는데 화면은 그대로 (Svelte가 `non_reactive_update` 경고를 낸다)
2. **`onclick={fn()}`** → 렌더링 때 바로 호출됨. `onclick={fn}` 또는 `onclick={() => fn()}`
3. **구조 분해로 상태를 꺼냄** → 복사된 값이라 반응하지 않음
4. **`$effect` 안에서 `$state`를 계속 바꿈** → 무한 루프 위험. 계산은 `$derived`로
5. **cleanup 누락** → `setInterval`이 컴포넌트가 사라져도 계속 돌아감

## 확인 문제

1. `let count = 0`과 `let count = $state(0)`은 템플릿에서 어떻게 다르게 동작하는가?
2. Svelte에서는 `fruits.push('딸기')`만으로 화면이 바뀌는데, React에서는 왜 안 되는가?
3. 합계를 `$effect`가 아니라 `$derived`로 만들어야 하는 이유는?
4. `$effect`가 return하는 함수는 언제 실행되는가?
5. `console.log(user)`로 찍은 값이 읽기 어려울 때 쓰는 방법은?

## 직접 해보기

- 장바구니(`Derived.svelte`)에 "상품 추가" 입력폼을 붙이고, 합계가 자동으로 갱신되는지 확인
- `Effect.svelte`에 `localStorage`로 마지막 `title`을 저장/복원하는 `$effect` 추가
- `$inspect(items)`를 넣고 수량을 바꿔 가며 콘솔 출력 확인
