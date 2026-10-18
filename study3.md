# study3. 실습3 — props · 이벤트(콜백) · `bind:`

> 이전: [study2](./study2.md) — `$state`, `$derived`, `$effect`
> 이번 목표: **컴포넌트를 쪼개고, 부모와 자식이 값을 주고받게 만든다.**
> 실습 코드: `src/lessons/study3/`
> 파일: `UserCard.svelte` · `Stepper.svelte` · `Rating.svelte` · `BindForm.svelte` · `Lesson.svelte`

---

## 1. 통신 방향 지도

```
            props (값, 함수)
   부모 ───────────────────────▶ 자식
        ◀───────────────────────
         콜백 prop 호출 (onchange ...)

   부모 ◀═════ bind:value ═════▶ 자식      (자식이 $bindable로 허용한 prop만)
```

| 방향 | 방법 | 이 실습 |
|---|---|---|
| 부모 → 자식 | props | `UserCard` |
| 자식 → 부모 | 콜백 prop | `Stepper` |
| 양방향 | `$bindable` + `bind:` | `Rating` |
| 폼 입력 ↔ 상태 | `bind:value` `bind:checked` `bind:group` | `BindForm` |

---

## 2. props — `$props()`

### 받는 쪽 (자식)

```svelte
<script>
  let { name, age = 20, role = 'guest', ...rest } = $props()
</script>
<article {...rest}>
  <strong>{name}</strong> {age}세 · {role}
</article>
```

- **구조 분해**로 받습니다. 이름이 곧 prop 이름입니다.
- `age = 20` : 부모가 안 넘기면 쓰이는 **기본값**
- `...rest` : 선언하지 않은 나머지 전부. `{...rest}`로 요소에 그대로 전달 (`title`, `class`, `data-*`, `aria-*` 등)

### 주는 쪽 (부모)

```svelte
<UserCard name="홍길동" />                          <!-- 문자열 리터럴 -->
<UserCard name="이영희" age={31} role="member" />    <!-- 숫자/변수는 {} -->

<script>const userData = { name: '김철수', age: 25 }</script>
<UserCard {...userData} />                          <!-- 객체를 펼쳐서 전달 -->
```

### 규칙

- **props는 읽기 전용처럼 다룹니다.** 자식이 `name = '다른값'`으로 덮어쓰면 데이터 흐름이 꼬입니다. 바꾸고 싶으면 아래의 콜백이나 `bind:`를 씁니다.
- 부모의 값이 바뀌면 자식이 받은 prop도 자동으로 바뀌고 화면이 갱신됩니다. (`$props()`로 받은 값은 반응형)
- 구조 분해한 변수를 다른 곳에서 파생할 때는 `$derived(name.toUpperCase())`를 씁니다.

---

## 3. 이벤트 = 콜백 props

Svelte 4의 `createEventDispatcher` / `on:이벤트`는 Svelte 5에서 **권장되지 않습니다.**
자식이 알리고 싶은 것은 **함수를 prop으로 받아서 호출**하면 됩니다.

```svelte
<!-- Stepper.svelte (자식) -->
<script>
  let { value, min = 0, max = 10, onchange } = $props()

  function update(next) {
    if (next < min || next > max) return
    onchange?.(next)            // 부모가 함수를 안 줬을 수도 있으니 ?. 로 안전하게
  }
</script>
<button onclick={() => update(value + 1)} disabled={value >= max}>+</button>
```

```svelte
<!-- 부모 -->
<Stepper value={qty} min={1} max={5} onchange={(next) => (qty = next)} />
```

- **상태는 부모가, 규칙(범위 제한 등)은 자식이** 담당하는 분업입니다. React의 "props down, callbacks up"과 같은 구조입니다.
- 이름은 관례로 `on`으로 시작합니다. 네이티브 `onclick`과 같은 형태라서 일관됩니다.

### DOM 이벤트 정리 (Svelte 5)

| 하고 싶은 것 | Svelte 4 | Svelte 5 |
|---|---|---|
| 클릭 | `on:click={fn}` | `onclick={fn}` |
| 입력 | `on:input={fn}` | `oninput={fn}` |
| 폼 제출 | `on:submit\|preventDefault={fn}` | `onsubmit={fn}` + 함수 안에서 `e.preventDefault()` |
| 이벤트 객체 | `e` | `e` (`e.currentTarget`은 이벤트가 붙은 요소) |

**수식어(`|preventDefault`, `|once`)는 Svelte 5에서 사라졌습니다.** 필요하면 함수 안에서 직접 처리합니다.

---

## 4. `$bindable` — 양방향 prop

```svelte
<!-- Rating.svelte (자식) -->
<script>
  let { value = $bindable(0), max = 5 } = $props()
</script>
<button onclick={() => (value = i + 1)}>★</button>      <!-- 자식이 prop을 직접 바꾼다 -->
```

```svelte
<!-- 부모 -->
<Rating bind:value={score} />
<button onclick={() => (score = 0)}>초기화</button>      <!-- 부모가 바꿔도 자식이 따라간다 -->
```

- 자식이 **`$bindable()`로 허용한 prop만** `bind:`로 연결할 수 있습니다. 그렇지 않은 prop에 `bind:`를 쓰면 개발 모드에서 에러(`bind_not_bindable`)가 납니다.
- 편하지만 데이터가 어디서 바뀌는지 추적하기 어려워집니다. **입력 컴포넌트(별점, 토글, 커스텀 인풋)** 정도에 쓰고, 나머지는 콜백이 더 명확합니다.
- Vue의 `v-model`, React의 "controlled component"를 한 줄로 줄인 셈입니다.

---

## 5. 폼 바인딩

```svelte
<input bind:value={form.name} />                     <!-- 텍스트 -->
<input type="number" bind:value={form.age} />        <!-- 숫자 : 자동으로 number 변환 -->
<textarea bind:value={form.memo}></textarea>
<select bind:value={form.city}>...</select>
<input type="checkbox" bind:checked={form.agree} />  <!-- 체크박스 단일 : true/false -->
<input type="radio" value="m" bind:group={form.gender} />                 <!-- 라디오 : 선택된 value -->
<input type="checkbox" value="vue" bind:group={form.skills} />           <!-- 체크박스 그룹 : 배열 -->
```

| 바인딩 | 대상 | 값 |
|---|---|---|
| `bind:value` | text, number, range, textarea, select | 문자열 (number/range는 숫자) |
| `bind:checked` | checkbox | boolean |
| `bind:group` | 같은 그룹의 radio / checkbox | radio는 선택값, checkbox는 배열 |

study2에서는 `value={...} oninput={...}`로 직접 연결했는데, `bind:value` 한 줄로 끝납니다.

### 폼 제출

```svelte
<script>
  function onsubmit(e) {
    e.preventDefault()                   // 페이지 새로고침 방지
    submitted = $state.snapshot(form)    // Proxy를 일반 객체로 복사해 저장
  }
</script>
<form {onsubmit}>...</form>              <!-- onsubmit={onsubmit} 의 축약형 -->
```

- `disabled={!form.agree}`처럼 **속성 값에 상태식을 그대로** 쓰면 동의 여부에 따라 제출 버튼이 자동으로 켜지고 꺼집니다.

---

## 6. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| props 받기 | `function C({ name })` | `defineProps<{ name }>()` | `let { name } = $props()` |
| 기본값 | `({ age = 20 })` | `withDefaults` | `let { age = 20 } = $props()` |
| 나머지 속성 | `{...rest}` | `v-bind="$attrs"` | `{...rest}` |
| 자식 → 부모 | `onChange` 콜백 prop | `emit('change')` | `onchange` 콜백 prop |
| 양방향 | value + onChange 직접 | `v-model` / `defineModel` | `bind:` + `$bindable()` |
| 입력 폼 | controlled input (value + onChange) | `v-model` | `bind:value` |
| 폼 제출 | `e.preventDefault()` | `@submit.prevent` | `e.preventDefault()` |

---

## 7. TypeScript 버전 메모

```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends HTMLAttributes<HTMLElement> {   // article이 받는 모든 HTML 속성 + 내 속성
    name: string
    age?: number           // ? 는 생략 가능 (기본값이 있는 prop)
    role?: string
  }
  let { name, age = 20, role = 'guest', ...rest }: Props = $props()
</script>
```

```ts
interface Props {
  value: number
  onchange?: (next: number) => void       // 콜백 prop은 함수 타입으로
}
```

- props 타입은 **`$props()` 앞에 `Props` 인터페이스로** 선언하는 것이 관례입니다.
- 폼 상태는 `interface Form`을 만들어 `$state<Form>({...})`로 선언하면 `bind:value={form.nmae}` 같은 오타를 `npm run check`가 잡아 줍니다.
- `onsubmit(e: SubmitEvent)` 처럼 이벤트 타입도 지정할 수 있습니다.

---

## 8. 자주 하는 실수

1. **자식에서 prop을 직접 대입** (`name = 'x'`) → 단방향 흐름이 깨짐. 콜백 또는 `$bindable`
2. **`bind:`를 `$bindable` 없는 prop에 사용** → 개발 모드 에러. 자식 쪽에서 `$bindable()`로 열어 줘야 함
3. **`onchange={fn()}`** 호출해서 넘김 → `onchange={fn}` / `onchange={(v) => ...}`
4. **`on:click` 같은 옛 문법 사용** → Svelte 5에서는 `onclick`. 한 컴포넌트 안에서 두 문법을 섞을 수 없음
5. **`bind:group`에 `$state`가 아닌 변수** → 반응하지 않음
6. **숫자 input 값을 문자열로 착각** → `type="number"`일 때만 자동 숫자 변환 (`select`는 문자열)

## 확인 문제

1. `let { name, age = 20, ...rest } = $props()` 에서 `age = 20`과 `...rest`는 각각 무슨 뜻인가?
2. Svelte 5에서 자식이 부모에게 "값이 바뀌었다"고 알리는 방법은? (옛 방식과 비교)
3. `bind:value`를 자식 컴포넌트의 prop에 쓰려면 자식에서 무엇이 필요한가?
4. `<form>`의 새로고침을 막으려면 Svelte 5에서는 어떻게 하는가?
5. 체크박스 여러 개의 선택 결과를 배열로 얻는 방법은?

## 직접 해보기

- `UserCard`에 `onselect` 콜백 prop을 추가해서 카드를 누르면 부모가 "선택된 사람" 이름을 표시하게 만들기
- `Stepper`를 `$bindable`로 바꿔서 `<Stepper bind:value={qty} />`로 쓰고, 콜백 방식과 코드량 비교
- `BindForm`에 "이메일" 입력을 추가하고, 이메일 형식이 아니면 제출 버튼을 `$derived`로 비활성화
