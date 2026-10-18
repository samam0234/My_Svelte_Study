# study0. Svelte 기초 이론

> 이 문서는 코드를 치기 전에 "Svelte가 무엇이고, 왜 Vue/React와 다른지"를 잡는 이론 파트입니다.
> 이후 study1~10, studyFinal은 모두 여기서 말하는 개념 위에 쌓입니다.

---

## 1. Svelte란?

Svelte는 **컴파일러 기반 UI 프레임워크**입니다.

- 우리가 쓰는 `.svelte` 파일은 브라우저가 이해하는 코드가 아닙니다.
- **빌드 시점**에 Svelte 컴파일러가 `.svelte` 파일을 읽고, 필요한 DOM 조작 코드가 담긴 평범한 JavaScript로 바꿔 줍니다.
- 그래서 "프레임워크 본체"를 통째로 브라우저에 보내는 대신, **내 앱에 필요한 부분만** 번들에 들어갑니다. 결과물이 작고 빠릅니다.

```
[ App.svelte ]  ──(Svelte 컴파일러 / Vite 플러그인)──▶  [ 순수 JS + 작은 런타임 ]  ──▶  브라우저
   내가 작성                  빌드 시점                          배포되는 결과물
```

### 한 줄 요약

| | 접근 |
|---|---|
| React | 런타임에 가상 DOM(Virtual DOM)을 만들고 **이전 것과 비교(diff)** 해서 바뀐 곳만 반영 |
| Vue | 런타임에 Proxy로 상태를 **추적**하고, 바뀐 상태가 쓰인 곳만 다시 그림 |
| Svelte | **빌드 시점**에 "이 상태가 바뀌면 이 DOM을 이렇게 고친다"는 코드를 미리 만들어 둠 |

> 정확히 하자면: Svelte 5부터는 컴파일된 코드가 작은 **시그널(signal) 런타임**과 함께 동작합니다.
> 그래도 핵심은 같습니다. **가상 DOM이 없고, 어떤 상태가 어떤 DOM에 연결되는지를 컴파일러가 알고 있다**는 점입니다.

---

## 2. 왜 Svelte인가

1. **간결함** : 같은 UI를 Vue/React보다 적은 코드로 씁니다. 상태 선언이 그냥 `let` 같은 변수 하나입니다.
2. **작은 번들** : 컴파일러가 안 쓰는 기능은 버립니다. 작은 프로젝트·데모에 잘 맞습니다.
3. **가상 DOM 없음** : diff 비용이 없고, 바뀐 DOM 노드만 직접 갱신합니다.
4. **풀스택으로 확장** : **SvelteKit**(라우팅, SSR, API 서버)으로 이어집니다. 이 저장소의 마지막 목표입니다.
5. **비교 학습** : Vue/React를 익힌 뒤 "같은 UI를 다른 방식으로" 다시 만들어 보면 개념이 더 단단해집니다.

---

## 3. `.svelte` 파일의 구조

컴포넌트 하나 = 파일 하나입니다. 한 파일 안에 세 영역이 있고, **모두 선택 사항**입니다.

```svelte
<script>
  // 1) 로직 (JavaScript / TypeScript)
  let count = $state(0);
</script>

<!-- 2) 마크업 (HTML + Svelte 문법) -->
<button onclick={() => count++}>
  눌린 횟수: {count}
</button>

<style>
  /* 3) 스타일 : 이 컴포넌트 안에서만 적용된다 (자동 스코프) */
  button { padding: 8px 16px; }
</style>
```

| 영역 | 설명 |
|---|---|
| `<script>` | 상태, 함수, props 선언. TypeScript를 쓰려면 `<script lang="ts">` |
| 마크업 | 일반 HTML. `{표현식}`으로 값을 끼워 넣고, `{#if}` `{#each}` 같은 블록을 씀 |
| `<style>` | **자동으로 컴포넌트 범위로 제한**됨. 다른 컴포넌트의 같은 클래스명과 충돌하지 않음 |

> React처럼 JSX로 반환하지 않고, Vue SFC처럼 `<template>`로 감싸지도 않습니다. 마크업은 그냥 파일의 본문입니다.

---

## 4. 반응형(Reactivity) — Svelte 5의 Runes

"상태가 바뀌면 화면이 자동으로 바뀐다"를 Svelte 5에서는 **룬(rune)** 이라는 `$`로 시작하는 특수 키워드로 표현합니다.
룬은 import 없이 쓰는 **컴파일러 지시어**입니다.

| 룬 | 역할 | 비슷한 개념 |
|---|---|---|
| `$state(초기값)` | 반응형 상태 선언 | React `useState`, Vue `ref/reactive` |
| `$derived(식)` | 다른 상태로 계산되는 값 (자동 갱신) | Vue `computed`, React `useMemo` |
| `$effect(() => {...})` | 상태가 바뀔 때 실행되는 부수 효과 | React `useEffect`, Vue `watchEffect` |
| `$props()` | 부모가 내려 준 props 받기 | React props, Vue `defineProps` |
| `$bindable()` | 부모와 양방향 바인딩이 가능한 prop | Vue `v-model` |
| `$inspect(값)` | 개발 중 값이 바뀔 때마다 콘솔 출력 | (디버깅용) |

```svelte
<script>
  let count = $state(0);                 // 상태
  let double = $derived(count * 2);      // 파생값 : count가 바뀌면 자동 재계산

  $effect(() => {                        // 부수 효과 : count가 바뀔 때마다 실행
    document.title = `count = ${count}`;
  });
</script>

<button onclick={() => count++}>{count} × 2 = {double}</button>
```

### 옛 문법과의 관계 (Svelte 3/4)

인터넷 자료에는 아직 옛 문법이 많이 보입니다. 알아만 두고, **이 저장소는 룬을 기본**으로 씁니다.

| 하고 싶은 것 | Svelte 3/4 (옛 문법) | Svelte 5 (룬) |
|---|---|---|
| 상태 | `let count = 0;` | `let count = $state(0);` |
| 파생값 | `$: double = count * 2;` | `let double = $derived(count * 2);` |
| 부수 효과 | `$: console.log(count);` | `$effect(() => console.log(count));` |
| props | `export let name;` | `let { name } = $props();` |
| 이벤트 | `on:click={...}` | `onclick={...}` |
| 슬롯 | `<slot />` | `{@render children()}` |

> 왜 바뀌었나? 옛 문법은 "컴포넌트 최상위에서만 반응형"이라는 제약이 있었습니다.
> 룬은 `.svelte.js` / `.svelte.ts` 파일에서도 쓸 수 있어서 **컴포넌트 밖에서 상태를 공유**하기 쉬워졌습니다. (study6에서 다룸)

---

## 5. 템플릿 문법 한눈에 보기

| 문법 | 의미 | 예 |
|---|---|---|
| `{값}` | 텍스트 보간 | `<h1>{title}</h1>` |
| `attr={값}` | 속성 바인딩 | `<img src={url} alt={name}>` |
| `{#if} {:else if} {:else} {/if}` | 조건 렌더링 | study4 |
| `{#each 배열 as 항목, i (key)} {/each}` | 리스트 렌더링 | study4 |
| `{#await 프라미스} {:then} {:catch} {/await}` | 비동기 상태 표시 | study8 |
| `{#snippet 이름(인자)} {/snippet}` / `{@render 이름()}` | 재사용 가능한 마크업 조각 | study5 |
| `bind:value={변수}` | 양방향 바인딩 | study3 |
| `class:active={조건}` | 조건부 클래스 | study4 |
| `use:액션` | DOM 노드에 붙는 재사용 로직 | study9 |
| `transition:fade` | 등장/퇴장 애니메이션 | study9 |
| `{@html 문자열}` | HTML 문자열을 그대로 삽입 (XSS 주의) | |

---

## 6. 컴포넌트 간 통신

Svelte 5에서는 통신 방식이 단순해졌습니다.

- **부모 → 자식** : props. `let { title, count = 0 } = $props();`
- **자식 → 부모** : **콜백 props**. 이벤트도 결국 함수를 prop으로 내려 주는 것입니다.
  (옛 `createEventDispatcher`는 더 이상 권장하지 않음)
- **양방향** : `$bindable()` + `bind:`
- **멀리 있는 컴포넌트끼리** : context(`setContext/getContext`) 또는 공유 상태 모듈(`.svelte.js`)
- **내용 끼워 넣기** : `children` 스니펫 (옛 `<slot>`의 대체)

---

## 7. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 핵심 방식 | 가상 DOM + diff | Proxy 기반 추적 + 가상 DOM | **컴파일 + 시그널**, 가상 DOM 없음 |
| 컴포넌트 파일 | `.jsx` / `.tsx` (함수) | `.vue` (SFC) | `.svelte` |
| 상태 | `useState` | `ref`, `reactive` | `$state` |
| 파생값 | `useMemo` (직접 의존성 관리) | `computed` | `$derived` (의존성 자동) |
| 부수 효과 | `useEffect` (의존성 배열) | `watch`, `watchEffect` | `$effect` (의존성 자동) |
| 이벤트 | `onClick={fn}` | `@click="fn"` | `onclick={fn}` |
| 리스트 | `arr.map(...)` | `v-for` | `{#each}` |
| 조건 | `cond && <A/>` | `v-if` | `{#if}` |
| 양방향 | 직접 구현 (value + onChange) | `v-model` | `bind:value` |
| 스타일 | CSS 파일/CSS-in-JS | `<style scoped>` | `<style>` (기본 스코프) |
| 풀스택 | Next.js | Nuxt | **SvelteKit** |

> **React와의 가장 큰 차이** : React는 상태가 바뀌면 **컴포넌트 함수가 다시 실행**됩니다.
> Svelte는 컴포넌트 함수가 **처음 한 번만** 실행되고, 이후엔 상태가 연결된 DOM 부분만 갱신됩니다.
> 그래서 `useEffect`의 의존성 배열, `useCallback` 같은 "재실행 대비 장치"가 필요 없습니다.

---

## 8. 개발 환경 구성 요소

| 도구 | 역할 |
|---|---|
| Node.js | JS 실행 환경 (이 저장소는 Node 20+ 기준) |
| npm | 패키지 관리 |
| **Vite** | 개발 서버 + 번들러. HMR(저장하면 즉시 반영) 제공 |
| `@sveltejs/vite-plugin-svelte` | Vite가 `.svelte` 파일을 컴파일하게 해 주는 플러그인 |
| `svelte` | 컴파일러 + 런타임 |
| TypeScript (선택) | `<script lang="ts">`로 타입 사용 |
| VS Code 확장 *Svelte for VS Code* | 문법 강조, 자동완성 |

### Svelte로 앱을 시작하는 두 가지 길

1. **Vite + Svelte (SPA)** : 클라이언트에서만 도는 앱. **이 저장소의 실습은 이 방식**입니다.
   - 라우팅이 필요하면 직접 만들거나 `svelte-spa-router` 같은 라이브러리를 씁니다. (study7)
2. **SvelteKit** : 파일 기반 라우팅, SSR, 서버 API까지 있는 풀스택 프레임워크.
   - Next.js(React), Nuxt(Vue)에 해당합니다. 이 저장소의 **다음 단계**입니다.

---

## 9. 앞으로의 진도 지도

| 문서 | 내용 |
|---|---|
| study0 | **기초 이론** (지금 이 문서) |
| study1 | 프로젝트 만들기, 명령어, 실습1 — 첫 컴포넌트와 템플릿 |
| study2 | 실습2 — 반응형 (`$state`, `$derived`, `$effect`) |
| study3 | 실습3 — props, 이벤트(콜백), `bind:` |
| study4 | 실습4 — 조건 렌더링, 리스트 |
| study5 | 실습5 — 컴포넌트 합성 (children, snippet) |
| study6 | 고급 1 — 공유 상태 (`.svelte.js` 모듈, context) |
| study7 | 고급 2 — 라우팅 |
| study8 | 고급 3 — 폼 + `fetch` API 연동 |
| study9 | 고급 4 — transition, action, 생명주기 |
| study10 | 고급 5 — 테스트(Vitest), 빌드/배포, SvelteKit 맛보기 |
| studyFinal | 응용 — 미니 게시판 (목록·상세·검색·로그인) |

### 실습 코드 위치

```
Svelte/
├─ study0.md ~ study10.md, studyFinal.md   ← 학습 문서
├─ JS_study/
│  ├─ demo/       ← study1~10 (JavaScript)
│  └─ project/    ← studyFinal (JavaScript)
└─ TS_study/
   ├─ demo/       ← study1~10 (TypeScript)
   └─ project/    ← studyFinal (TypeScript)
```

JS 폴더와 TS 폴더는 **같은 내용을 서로 다른 언어로** 작성합니다. 서로 독립이라 한쪽만 따라가도 됩니다.

---

## 10. 정리

- Svelte는 **빌드 시점에 컴파일**해서 가상 DOM 없이 필요한 DOM만 갱신한다.
- `.svelte` 파일 = `<script>` + 마크업 + `<style>`(자동 스코프).
- Svelte 5의 반응형은 **룬**: `$state`, `$derived`, `$effect`, `$props`.
- 컴포넌트 함수는 **한 번만** 실행된다. (React와 가장 다른 점)
- 이 저장소는 Vite SPA로 기초를 쌓고, 마지막에 **SvelteKit**으로 이어간다.

## 확인 문제

1. Svelte가 "컴파일러"라는 말은 React/Vue와 어떤 점이 다르다는 뜻인가?
2. `let count = 0;`과 `let count = $state(0);`의 차이는? (Svelte 5 기준)
3. `$derived`와 `$effect`는 각각 언제 쓰는가?
4. 자식이 부모에게 값을 알리고 싶을 때 Svelte 5에서는 어떻게 하는가?
5. 같은 `<style>`의 `button { ... }`가 다른 컴포넌트의 버튼에 영향을 주지 않는 이유는?
