# study9. 고급 기술 구현 4 — transition · animate · action · 생명주기

> 이전: [study8](./study8.md) — 폼 + API 연동
> 이번 목표: **화면에 움직임을 넣고(애니메이션), DOM에 붙는 재사용 로직(액션)을 만들고, 컴포넌트의 생명주기를 이해한다.**
> 실습 코드: `src/lessons/study9/`
> 파일: `TransitionDemo` · `FlipList` · `ActionDemo` · `LifecycleDemo`(`LifeChild`) · `MotionDemo` · `lib/actions.js` · `lib/lifelog.svelte.js`

---

## 1. `transition:` — 들어오고 나갈 때의 애니메이션

```svelte
<script>
  import { fade, fly, slide, scale } from 'svelte/transition'
  let show = $state(true)
</script>

{#if show}
  <div transition:fade>들어올 때도 나갈 때도 fade</div>
  <div in:fly={{ y: 24 }} out:fade>들어올 땐 fly, 나갈 땐 fade</div>
{/if}
```

| 지시어 | 의미 |
|---|---|
| `transition:fade` | 들어올 때(intro)와 나갈 때(outro) **같은** 효과 (양방향, 중간에 뒤집을 수 있음) |
| `in:fly` | 들어올 때만 |
| `out:fade` | 나갈 때만 |
| `={{ duration, delay, easing, ... }}` | 효과마다 다른 옵션 |

### 내장 트랜지션 (`svelte/transition`)

| 이름 | 효과 |
|---|---|
| `fade` | 투명도 |
| `fly` | 이동 + 투명도 (`x`, `y`) |
| `slide` | 높이/너비가 펼쳐짐 (`axis`) |
| `scale` | 크기 (`start`) |
| `blur` | 흐림 |
| `draw` | SVG 선 그리기 |
| `crossfade` | 두 목록 사이 이동 효과 (할 일 목록에서 "완료"로 옮기기 등) |

이징(가속 곡선)은 `svelte/easing`의 `cubicOut`, `elasticOut` 등을 `easing:` 옵션에 넘깁니다.

### 꼭 알아둘 규칙

- 트랜지션은 **요소가 만들어지고 사라지는 순간**에만 동작합니다 → `{#if}`, `{#each}`, `{#key}`, `{#await}` 같은 블록 안에서.
- 나가는 애니메이션이 끝날 때까지 요소는 DOM에 **남아 있습니다.** (그 뒤에 제거)
- Svelte 5에서 트랜지션은 **기본이 "local"** 입니다. 바로 속한 블록이 만들어질 때만 재생되고, 부모 블록이 통째로 나타나거나 사라질 땐 재생되지 않습니다. 부모 때도 재생하려면 `transition:fade|global`.
- 애니메이션이 싫은 사용자(OS의 "동작 줄이기")를 위해 `prefersReducedMotion`을 확인하는 습관이 좋습니다. (아래 5절)

### 커스텀 트랜지션

```js
function typewriter(node, { speed = 30 } = {}) {
  const text = node.textContent
  return {
    duration: text.length * speed,           // 전체 시간(ms)
    tick(t) {                                // t: in이면 0→1, out이면 1→0
      node.textContent = text.slice(0, Math.trunc(text.length * t))
    },
  }
}
// <p transition:typewriter>...</p>
```

- `css(t, u)`를 돌려주면 CSS 애니메이션(부드럽고 메인 스레드 부담 적음), `tick(t, u)`를 돌려주면 JS로 매 프레임 호출합니다. 가능하면 `css` 쪽이 성능에 좋고, 텍스트 변경처럼 CSS로 표현이 안 되는 경우만 `tick`을 씁니다.

---

## 2. `animate:flip` — 순서가 바뀔 때 부드럽게 이동

```svelte
<script>
  import { flip } from 'svelte/animate'
</script>

{#each items as item (item.id)}
  <li animate:flip={{ duration: 300 }}>{item.label}</li>
{/each}
```

- 목록을 섞거나 정렬하면 항목이 **순간이동하지 않고 제 위치로 미끄러져 갑니다.**
- 조건: **key가 있는 `{#each}`의 바로 아래 요소**에만 쓸 수 있습니다. (study4에서 key를 강조한 이유)
- `transition:scale`을 함께 쓰면 추가/삭제도 부드럽게 보입니다.
- `flip` = First · Last · Invert · Play. 이동 전/후 위치를 재서 차이만큼 되감은 뒤 재생하는 기법입니다.

---

## 3. 액션 `use:` — DOM 요소에 붙는 재사용 로직

React의 `ref` + `useEffect`, Vue의 커스텀 디렉티브(`v-xxx`)에 해당합니다.

```js
// lib/actions.js
export function clickOutside(node, callback) {
  function onClick(event) {
    if (!node.contains(event.target)) callback?.(event)
  }
  document.addEventListener('click', onClick, true)

  return {
    update(next) { callback = next },                             // 매개변수가 바뀌면
    destroy()    { document.removeEventListener('click', onClick, true) },  // 요소가 사라지면
  }
}
```

```svelte
<div class="dropdown" use:clickOutside={() => (menuOpen = false)}>
  <button onclick={() => (menuOpen = !menuOpen)}>메뉴</button>
  {#if menuOpen}<ul class="menu">...</ul>{/if}
</div>
```

| 부분 | 설명 |
|---|---|
| `node` | 액션이 붙은 **실제 DOM 요소** |
| 두 번째 인자 | `use:액션={값}`에서 넘긴 매개변수 |
| `update(next)` | 매개변수가 바뀔 때 호출 (선택) |
| `destroy()` | 요소가 사라질 때 호출 → **리스너/타이머 정리** (사실상 필수) |

### 실습에서 만든 액션 3개

| 액션 | 용도 |
|---|---|
| `clickOutside` | 드롭다운·모달을 바깥 클릭으로 닫기 |
| `autofocus` | 요소가 만들어지면 자동 포커스(+ 텍스트 전체 선택) |
| `longpress` | N ms 이상 누르고 있으면 콜백 호출 (`{ duration, onlongpress }`) |

### 설계 포인트

- **버튼과 메뉴를 같은 wrapper에 두고 wrapper에 액션을 붙입니다.** 버튼에 따로 붙이면 "버튼 클릭 = 메뉴 바깥 클릭"이 되어 열자마자 닫힙니다.
- 문서 전체에 거는 리스너는 **캡처 단계(`true`)** 로 걸면 안쪽에서 `stopPropagation()`을 해도 놓치지 않습니다.
- 액션은 요소 자체만 다룹니다. 상태·렌더링은 컴포넌트의 몫이고, 액션은 "이 요소에 이런 동작을 더한다"만 담당하도록 작게 유지합니다.

### 새로운 방식: `{@attach}` (어태치먼트, Svelte 5.29+)

```js
export function clickOutsideAttach(callback) {
  return (node) => {
    function onClick(event) { if (!node.contains(event.target)) callback?.(event) }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)   // 정리 함수
  }
}
```

```svelte
<div {@attach clickOutsideAttach(() => (menu2Open = false))}>...</div>
```

| | 액션 `use:` | 어태치먼트 `{@attach}` |
|---|---|---|
| 형태 | `(node, param) => { update, destroy }` | `(node) => cleanup` |
| 매개변수 변경 | `update()`를 직접 구현 | 안에서 읽은 반응형 값이 바뀌면 **자동으로 정리 후 재실행** |
| 컴포넌트에 전달 | 어려움 | `...rest`로 펼치면 자식 요소에 그대로 전달됨 |

새 코드는 어태치먼트, 기존 라이브러리가 제공하는 액션은 `fromAction(액션, () => 인자)`로 변환해서 쓸 수 있습니다.

---

## 4. 생명주기(lifecycle)

Svelte 5에서 남은 것은 사실상 `onMount`, `onDestroy`, 그리고 `$effect`입니다. (옛 `beforeUpdate`/`afterUpdate`는 사용 중단)

```svelte
<script>
  import { onMount, onDestroy } from 'svelte'

  log('① <script> 실행')                              // 컴포넌트 생성
  onMount(() => { log('② onMount'); return () => log('④ onMount cleanup') })
  $effect(() => { log('③ $effect'); return () => log('⑤ $effect cleanup') })
  onDestroy(() => log('⑥ onDestroy'))
</script>
```

실습에서 직접 기록한 순서입니다.

```
[만들어질 때]  ① <script> 실행  →  ② onMount  →  ③ $effect 실행
[상태 변경 시] ⑤ $effect cleanup (이전 값)  →  ③ $effect 실행 (새 값)
[사라질 때]    ④ onMount cleanup  →  ⑤ $effect cleanup  →  ⑥ onDestroy
```

| 도구 | 언제 | 비고 |
|---|---|---|
| `<script>` 최상위 | 컴포넌트가 만들어질 때 (DOM에 붙기 전) | 상태·함수 선언, 초기 계산 |
| `onMount` | DOM에 붙은 **직후 1회** | 외부 라이브러리 초기화, 첫 데이터 요청. **서버 렌더링에서는 실행되지 않음** |
| `$effect` | DOM 갱신 후, 읽은 상태가 바뀔 때마다 | 동기화·구독. cleanup 필수 |
| `onDestroy` | 사라질 때 | 서버 렌더링에서도 호출되는 유일한 생명주기 |
| `tick()` | `await tick()` — 대기 중인 상태 변경이 DOM에 반영된 뒤 | 스크롤 이동, 포커스, 크기 측정 |

> 순서 규칙을 외우기보다 **"정리할 것은 만든 곳 옆에서 return으로 정리한다"** 는 원칙을 지키면 됩니다. 서로 다른 도구 사이의 실행 순서에 의존하는 코드는 만들지 마세요.

### `bind:this`, `tick`, `bind:clientWidth`

```svelte
<script>
  let box = $state()                         // 요소가 만들어지기 전에는 undefined

  async function send() {
    messages.push(text)                      // 상태는 즉시 바뀌지만 DOM은 아직 그대로
    await tick()                             // DOM 갱신이 끝날 때까지 대기
    box.scrollTop = box.scrollHeight         // 새 메시지가 그려진 뒤에 맨 아래로 스크롤
  }
</script>

<div bind:this={box} bind:clientWidth={width}>...</div>   <!-- 요소 참조 + 너비를 읽기 전용으로 바인딩 -->
```

- `tick()` 없이 바로 `scrollHeight`를 읽으면 **새 메시지가 반영되기 전의 높이**라서 마지막 줄이 가려진 채로 스크롤됩니다.
- `bind:clientWidth` / `clientHeight` / `offsetWidth` 등은 `ResizeObserver`로 요소 크기를 추적해서 **읽기 전용 상태**로 줍니다.

---

## 5. `svelte/motion` — 값이 부드럽게 변한다

```svelte
<script>
  import { Tween, Spring, prefersReducedMotion } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  const progress = new Tween(0, { duration: prefersReducedMotion.current ? 0 : 700, easing: cubicOut })
  const spring   = new Spring(0, { stiffness: 0.1, damping: 0.25 })
</script>

<button onclick={() => (progress.target = 70)}>70%</button>
<div style:width="{progress.current}%"></div>            <!-- current가 700ms 동안 서서히 target으로 -->
```

| | `Tween` | `Spring` |
|---|---|---|
| 성질 | 정해진 시간·이징 곡선으로 이동 | 스프링 물리(탄성)로 튕기며 도착 |
| 읽기 | `.current` (현재), `.target` (목표) | 동일 |
| 설정 | `.target = v` 또는 `.set(v, { duration })` | `.target = v` |
| 옵션 | `duration`, `delay`, `easing` | `stiffness`, `damping`, `precision` |

- CSS `transition`으로 안 되는 **숫자·색상·좌표 값**을 부드럽게 만들 때 씁니다. (카운트업, 진행률 막대)
- 옛 `tweened()` / `spring()` 스토어 방식은 클래스로 대체되었습니다.
- `prefersReducedMotion.current`가 참이면 `duration: 0`으로 즉시 변경 — 접근성 배려.

---

## 6. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 등장/퇴장 애니메이션 | Framer Motion, React Transition Group | `<Transition>` 컴포넌트 | **내장** `transition:` / `in:` / `out:` |
| 목록 이동 애니메이션 | Framer Motion `layout` | `<TransitionGroup>` | **내장** `animate:flip` |
| DOM에 로직 붙이기 | `ref` + `useEffect` | 커스텀 디렉티브 `v-xxx` | **액션** `use:` / 어태치먼트 `{@attach}` |
| 요소 참조 | `useRef` | `ref="el"` | `bind:this={el}` |
| 마운트 시 1회 | `useEffect(fn, [])` | `onMounted` | `onMount` |
| 정리 | `useEffect`의 return | `onUnmounted` | cleanup return / `onDestroy` |
| DOM 갱신 후 대기 | `flushSync`, `useLayoutEffect` | `await nextTick()` | `await tick()` |
| 값 애니메이션 | react-spring | (직접 구현/VueUse) | **내장** `Tween`, `Spring` |

> Svelte는 애니메이션 도구가 **프레임워크에 내장**되어 있는 것이 큰 장점입니다. 별도 라이브러리 설치 없이 트랜지션, flip, 스프링을 씁니다.

---

## 7. TypeScript 버전 메모

```ts
import type { TransitionConfig } from 'svelte/transition'
function typewriter(node: HTMLElement, { speed = 30 }: { speed?: number } = {}): TransitionConfig { ... }

import type { Attachment } from 'svelte/attachments'
export function clickOutsideAttach(callback?: (e: MouseEvent) => void): Attachment<HTMLElement> { ... }

export function clickOutside(node: HTMLElement, callback?: (e: MouseEvent) => void) {
  function onClick(event: MouseEvent) {
    if (!node.contains(event.target as Node)) callback?.(event)    // EventTarget → Node로 좁히기
  }
  ...
}
```

```svelte
let box = $state<HTMLDivElement>()          // 처음엔 undefined 이므로 사용 전 if (box) 확인
if (select && node instanceof HTMLInputElement) node.select()   // instanceof로 타입 좁히기
```

- `event.target`은 `EventTarget | null`이라 DOM 메서드를 쓰려면 `as Node`로 단언하거나 `instanceof`로 좁혀야 합니다.
- 요소 참조 변수는 **요소가 만들어지기 전엔 `undefined`** 이므로 `HTMLDivElement | undefined`입니다.

---

## 8. 자주 하는 실수

1. **`animate:flip`을 key 없는 each에 사용** → 에러. 반드시 `(item.id)` 같은 key
2. **트랜지션을 일반 요소에 붙이고 기대** → `{#if}` / `{#each}` 같은 블록의 요소여야 재생됨
3. **부모 블록이 사라질 때 자식 트랜지션이 안 보임** → 기본이 local. `|global` 필요
4. **액션에서 `destroy` 누락** → 요소가 사라져도 `document` 리스너가 남아 누수·중복 실행
5. **`onMount`에서 return하지 않고 `setInterval`만 만듦** → 타이머가 계속 돔
6. **상태 변경 직후 DOM을 읽음** → 아직 반영 전. `await tick()`
7. **컴포넌트 초기화 중에 `$state` 배열에 `push`하는 로그 함수** → 읽기가 추적되어 무한 재생성. `untrack`으로 감싸기 (`lib/lifelog.svelte.js`)
8. **버튼에 `clickOutside`를 붙임** → 버튼 클릭이 "바깥 클릭"으로 처리됨. 버튼+메뉴를 감싸는 wrapper에 붙이기

## 확인 문제

1. `transition:fade`와 `in:fly out:fade`의 차이는?
2. `animate:flip`이 key가 있는 `{#each}`에서만 동작하는 이유는?
3. 액션의 `update`와 `destroy`는 각각 언제 호출되는가?
4. `onMount`와 `$effect`의 차이는? 언제 어느 것을 쓰는가?
5. `await tick()`이 필요한 상황을 예로 들어 설명하라.

## 직접 해보기

- `FlipList`에 드래그 대신 "위로/아래로" 버튼을 추가해서 항목 이동에 flip 적용하기
- `longpress`를 `{@attach}` 버전으로 다시 만들고 두 방식의 코드 차이 비교하기
- 모달(study5)에 `transition:fade`(배경)와 `transition:fly`(본문)를 적용하고, `prefersReducedMotion`이면 `duration: 0`이 되게 하기
