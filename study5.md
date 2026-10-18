# study5. 실습5 — 컴포넌트 합성 (`children` · `snippet`)

> 이전: [study4](./study4.md) — 조건 렌더링, 리스트
> 이번 목표: **"빈칸이 있는 컴포넌트"를 만들어 재사용한다.** (카드, 버튼, 모달, 탭, 제네릭 리스트)
> 실습 코드: `src/lessons/study5/`
> 파일: `Card` · `Button` · `Modal` · `DataList` · `Tabs` · `Lesson.svelte`

---

## 1. 합성(composition)이란

props는 **데이터**를 넘깁니다. 합성은 **화면의 모양(마크업)** 을 넘깁니다.

```
props     :  <UserCard name="홍길동" />                    ← 값
합성       :  <Card> <p>이 내용을 카드 안에 넣어줘</p> </Card>  ← 마크업
```

Svelte 5에서 마크업을 넘기는 도구는 **snippet** 하나입니다. (Svelte 4의 `<slot>`을 대체)

| 하고 싶은 것 | Svelte 4 (옛 문법) | Svelte 5 |
|---|---|---|
| 태그 사이 내용 받기 | `<slot />` | `{@render children?.()}` |
| 이름 있는 자리 | `<slot name="header" />` | `{@render header?.()}` |
| 부모가 채우기 | `<div slot="header">` | `{#snippet header()}...{/snippet}` |
| 자식 데이터를 부모에게 | `<slot {item} />` + `let:item` | `{@render item(it)}` + `{#snippet item(it)}` |

---

## 2. `children` — 태그 사이의 내용

```svelte
<!-- Card.svelte -->
<script>
  let { title, children } = $props()
</script>
<article>
  <h3>{title}</h3>
  {@render children?.()}
</article>
```

```svelte
<!-- 사용 -->
<Card title="기본 카드">
  <p>이 문단이 children이 된다.</p>
</Card>
```

- 컴포넌트 태그 **사이에 쓴 내용은 자동으로 `children`이라는 prop**이 됩니다. 이름이 정해져 있는 특별한 prop입니다.
- `{@render children?.()}` : snippet을 **호출해서 그 자리에 그립니다.** `?.`는 부모가 아무것도 안 줬을 때 에러를 피하기 위한 안전장치입니다.

---

## 3. 이름 있는 snippet — header / footer

```svelte
<!-- Card.svelte -->
<script>
  let { title, children, header, footer } = $props()
</script>

<header>
  {#if header}{@render header()}{:else}<h3>{title}</h3>{/if}   <!-- 안 주면 기본 제목 -->
</header>
<div class="body">{@render children?.()}</div>
{#if footer}<footer>{@render footer()}</footer>{/if}
```

```svelte
<!-- 사용 -->
<Card>
  {#snippet header()}
    <h3>제목 <span class="badge">NEW</span></h3>
  {/snippet}

  본문은 snippet이 아닌 나머지 내용 → 자동으로 children

  {#snippet footer()}마지막 수정: 오늘{/snippet}
</Card>
```

- **컴포넌트 태그 안에 선언한 `{#snippet 이름()}`은 같은 이름의 prop으로 전달**됩니다.
- snippet이 아닌 나머지 내용은 `children`으로 묶입니다.
- 선택 영역은 `{#if header}`로 있을 때만 그리고, 없으면 기본 UI를 보여 줄 수 있습니다.

---

## 4. 같은 파일 안에서 쓰는 snippet — 마크업 함수

```svelte
{#snippet badge(text, color)}
  <span class="badge" style:background={color}>{text}</span>
{/snippet}

{@render badge('NEW', 'seagreen')}
{@render badge('초안', 'gray')}
```

- 반복되는 작은 마크업을 **파라미터가 있는 함수처럼** 재사용합니다. 컴포넌트 파일을 새로 만들 만큼은 아닐 때 좋습니다.
- 같은 스코프(같은 파일의 템플릿)에서 선언한 snippet은 **다른 snippet 안에서도** 쓸 수 있습니다. (Lesson에서 `badge`를 Card의 header snippet 안에서 호출)
- 다른 파일에서 쓰고 싶다면 `<script module>`에서 `export { badge }` 하는 방법이 있습니다. (필요해지면 사용)

---

## 5. 래퍼 컴포넌트 — `Button` 과 `...rest`

```svelte
<!-- Button.svelte -->
<script>
  let { variant = 'default', children, ...rest } = $props()
</script>
<button class={['btn', variant]} {...rest}>
  {@render children?.()}
</button>
```

```svelte
<Button variant="primary" onclick={() => clicks++}>저장</Button>
<Button disabled>비활성</Button>
```

- `variant`와 `children`만 직접 처리하고 **나머지(`onclick`, `disabled`, `type`, `aria-*`)는 rest로 받아 그대로 `<button>`에 전달**합니다.
- 덕분에 `Button`은 이벤트 종류를 몰라도 되고, 일반 `<button>`처럼 쓸 수 있습니다.
- `class={['btn', variant]}` : 배열/객체를 `class`에 바로 쓸 수 있습니다. (React의 `clsx`/`classnames`가 내장된 셈) falsy 값은 자동으로 걸러집니다.

---

## 6. 모달 — `$bindable` + `actions` snippet

```svelte
<!-- Modal.svelte 요약 -->
<script>
  let { open = $bindable(false), title, children, actions } = $props()
</script>
<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

{#if open}
  <div class="backdrop" onclick={() => (open = false)}>
    <div class="modal" role="dialog" onclick={(e) => e.stopPropagation()}>
      {@render children?.()}
      {#if actions}{@render actions()}{:else}<button onclick={() => (open = false)}>닫기</button>{/if}
    </div>
  </div>
{/if}
```

```svelte
<Modal bind:open={modalOpen} title="정말 삭제할까요?">
  <p>본문</p>
  {#snippet actions()}
    <button onclick={() => (modalOpen = false)}>취소</button>
    <Button variant="danger" onclick={remove}>삭제</Button>
  {/snippet}
</Modal>
```

- **열림 상태는 부모가 소유**하고(`modalOpen`), 모달 내부의 닫기 동작도 같은 값을 바꿉니다. → `bind:open` (study3의 `$bindable`)
- `<svelte:window>` : `window`에 이벤트를 붙이는 특수 요소. 컴포넌트가 사라지면 **자동으로 해제**됩니다. (`addEventListener` + cleanup을 직접 쓸 필요 없음)
- `e.stopPropagation()`으로 모달 안쪽 클릭이 배경 클릭으로 번지지 않게 막았습니다.
- 버튼 영역(`actions`)은 선택 snippet: 안 주면 기본 "닫기" 버튼을 보여 줍니다.

> 접근성 참고: 실제 서비스에서는 `<dialog>` 요소(`showModal()`)나 포커스 트랩을 쓰는 것이 좋습니다. 여기서는 합성 개념에 집중하기 위해 단순하게 만들었습니다.

---

## 7. 렌더 프롭 — snippet에 파라미터 넘기기 (`DataList`)

자식이 **데이터를 갖고 있고**, 부모가 **모양을 정할 때** 씁니다.

```svelte
<!-- DataList.svelte -->
<script>
  let { items, item, empty } = $props()
</script>
{#if items.length > 0}
  <ul>
    {#each items as it, i}
      <li>{@render item(it, i)}</li>        <!-- 항목과 인덱스를 snippet에 넘김 -->
    {/each}
  </ul>
{:else if empty}
  {@render empty()}
{/if}
```

```svelte
<!-- 부모가 항목의 모양을 정한다 -->
<DataList items={todos}>
  {#snippet item(todo, i)}
    <span>{i + 1}. {todo.text}</span>
    {@render badge(todo.done ? '완료' : '진행', ...)}
  {/snippet}
  {#snippet empty()}<p>할 일이 없어요</p>{/snippet}
</DataList>
```

- "반복·빈 상태 처리"는 `DataList`가, "각 항목 모양"은 사용하는 쪽이 정합니다. 테이블, 드롭다운, 가상 스크롤 목록 등 라이브러리 컴포넌트가 이 패턴을 씁니다.
- Vue의 **scoped slot**, React의 **render props**(`children`을 함수로) 와 같은 개념입니다.

---

## 8. 탭 — 상태는 자식, 내용은 부모

```svelte
<!-- Tabs.svelte -->
<script>
  let { tabs, panel } = $props()
  let selected = $state(null)                      // 사용자가 고른 탭 (아직 없으면 null)
  const active = $derived(selected ?? tabs[0]?.id) // 화면에 쓰는 값 = 고른 값, 없으면 첫 번째
</script>
{#each tabs as tab (tab.id)}
  <button onclick={() => (selected = tab.id)}>{tab.label}</button>
{/each}
{@render panel(active)}                            <!-- 선택된 id를 넘겨 부모가 내용을 그림 -->
```

> **왜 `let active = $state(tabs[0].id)`로 쓰지 않았나?**
> prop(`tabs`)의 현재 값을 `$state` 초기값으로 복사하면, 나중에 `tabs`가 바뀌어도 따라가지 못합니다.
> Svelte가 `state_referenced_locally` 경고로 알려 줍니다. "사용자가 고른 값"과 "화면에 쓰는 값"을 나누고 후자를 `$derived`로 만들면 해결됩니다.

---

## 9. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 태그 사이 내용 | `props.children` | `<slot />` | `children` snippet |
| 이름 있는 자리 | props로 JSX 전달 (`header={<h3/>}`) | `<slot name>` / `<template #header>` | `{#snippet header()}` |
| 자식 데이터를 부모에게 | render props (`children(item)`) | scoped slot (`#default="{ item }"`) | `{#snippet item(it)}` |
| 래퍼 속성 전달 | `{...rest}` | `v-bind="$attrs"` | `{...rest}` |
| 클래스 조합 | `clsx` 등 외부 라이브러리 | `:class="[a, { b }]"` | `class={[a, { b }]}` 내장 |
| 전역 이벤트 | `useEffect` + `addEventListener` | `onMounted`/`onUnmounted` | `<svelte:window>` |

---

## 10. TypeScript 버전 메모

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  interface Props extends HTMLButtonAttributes {       // <button>의 모든 속성 + 내 속성
    variant?: 'default' | 'primary' | 'danger' | 'ghost'
    children?: Snippet                                  // 파라미터 없는 snippet
  }
  let { variant = 'default', children, ...rest }: Props = $props()
</script>
```

```svelte
<!-- DataList.svelte : 제네릭 컴포넌트 -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte'
  interface Props {
    items: T[]
    item: Snippet<[T, number]>      // 파라미터 타입은 튜플로: (항목, 인덱스)
    empty?: Snippet
  }
  let { items, item, empty }: Props = $props()
</script>
```

```svelte
<!-- 사용하는 쪽에서는 snippet 파라미터에도 타입을 적는다 -->
{#snippet item(todo: Todo, i: number)} ... {/snippet}
```

- `<script generics="T">` 는 컴포넌트에 **타입 매개변수**를 선언합니다. `items={todos}`를 넘기면 `T`가 `Todo`로 정해집니다.

---

## 11. 자주 하는 실수

1. **`{@render children()}`에서 `?.` 누락** → 부모가 내용을 안 주면 `children is not a function` 에러
2. **snippet 이름과 prop 이름이 다름** → 컴포넌트 태그 안의 `{#snippet footer()}`는 자식의 `footer` prop으로 전달됨
3. **`<slot>`을 계속 사용** → Svelte 5에서 동작은 하지만(호환), 새 코드에서는 snippet 사용. 한 컴포넌트에서 둘을 섞지 않기
4. **부모 쪽 snippet 안의 요소를 자식의 `<style>`로 꾸미려 함** → 스코프 해시가 달라 적용 안 됨. `:global(...)` 또는 부모 쪽 스타일 사용 (Card의 `header :global(h3)`)
5. **prop을 `$state` 초기값으로 복사** → `$derived`로 계산

## 확인 문제

1. `children`은 어떻게 만들어지는가? 직접 prop으로 전달하지 않았는데도 받을 수 있는 이유는?
2. 이름 있는 snippet(`header`, `footer`)을 부모는 어디에, 자식은 어떻게 쓰는가?
3. `...rest`를 `<button>`에 펼쳐서 얻는 이점은?
4. 렌더 프롭(`DataList`)에서 "누가 반복하고, 누가 모양을 정하는가"?
5. `<svelte:window>`를 쓰면 `addEventListener`보다 좋은 점은?

## 직접 해보기

- `Card`에 `variant="warning"` prop을 추가해서 header 배경색이 바뀌게 만들기
- `Tabs`에 `bind:`로 선택된 탭을 부모에서도 알 수 있게 만들어 보기 (`selected`를 `$bindable`로)
- `DataList`에 `key` 함수 prop을 받아 `{#each items as it (key(it))}`로 바꿔 보기
