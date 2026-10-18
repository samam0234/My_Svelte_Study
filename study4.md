# study4. 실습4 — 조건 렌더링 · 리스트

> 이전: [study3](./study3.md) — props, 콜백 이벤트, `bind:`
> 이번 목표: **조건에 따라 화면을 나누고, 배열을 목록으로 그리고, 검색·필터·정렬을 붙인다.**
> 실습 코드: `src/lessons/study4/`
> 파일: `Conditional.svelte` · `TodoList.svelte` · `SearchList.svelte` · `KeyDemo.svelte` · `Lesson.svelte`

---

## 1. 조건 렌더링 `{#if}`

```svelte
{#if score >= 90}
  <p>최우수</p>
{:else if score >= 80}
  <p>우수</p>
{:else}
  <p>재도전</p>
{/if}
```

- 블록은 `{#` 로 열고 `{:` 로 이어 가고 `{/` 로 닫습니다.
- 조건이 거짓이면 해당 DOM이 **아예 만들어지지 않습니다.** (`display: none`이 아님) 조건이 바뀌면 생성/제거됩니다.
- 값을 고르는 정도라면 `{#if}` 대신 삼항식도 충분합니다: `{loggedIn ? '로그아웃' : '로그인'}`
- 같은 판정을 여러 곳에서 쓴다면 `$derived`로 한 번만 계산해 두세요.

### 클래스·스타일 토글

```svelte
<button class:danger={isDanger}>...</button>     <!-- isDanger가 참일 때만 .danger 클래스 -->
<button class:danger>...</button>                 <!-- 변수 이름이 클래스 이름과 같으면 축약 -->
<span style:color={isDanger ? 'crimson' : 'inherit'}>...</span>   <!-- CSS 속성 하나를 바인딩 -->
```

`<style>` 안에서 `.danger { ... }`를 정의하면 `class:danger`로 붙는 클래스에도 스코프 스타일이 적용됩니다.

---

## 2. 리스트 `{#each}`

```svelte
{#each todos as todo, i (todo.id)}
  <li>{i + 1}. {todo.text}</li>
{:else}
  <li>할 일이 없습니다.</li>
{/each}
```

| 부분 | 의미 |
|---|---|
| `todos` | 반복할 배열 (iterable, 배열 비슷한 객체도 가능) |
| `as todo` | 각 항목을 담는 변수 |
| `, i` | 인덱스 (선택) |
| `(todo.id)` | **key** — 항목을 식별하는 값 (선택이지만 사실상 필수) |
| `{:else}` | 배열이 **비어 있을 때만** 렌더링 (빈 상태 UI) |

- React의 `todos.map(t => <li key={t.id}>...</li>)` , Vue의 `v-for="t in todos" :key="t.id"`에 해당합니다.
- `{#each { length: 5 } as _, i}` 처럼 **횟수만큼 반복**할 수도 있습니다. (별점 컴포넌트에서 사용)

### 왜 key가 필요한가 — `KeyDemo.svelte`

```svelte
{#each items as item (item.id)}   <!-- key 있음 -->
{#each items as item}             <!-- key 없음 -->
```

입력창 세 개에 글을 쓴 뒤 **순서 뒤집기**를 눌러 보세요.

| | 동작 |
|---|---|
| key 있음 | DOM 노드가 **항목을 따라** 이동 → 입력한 글도 같이 이동 |
| key 없음 | DOM 노드는 **제자리**, 안의 내용(placeholder)만 갈아 끼움 → 입력한 글이 엉뚱한 항목에 남음 |

입력창, 체크박스, 포커스, 애니메이션(study9)이 들어 있는 목록은 **항상 key를 지정**합니다.
key는 `index`가 아니라 `id` 같은 **고유하고 변하지 않는 값**이어야 합니다.

### `{@const}`

```svelte
{#each results as p (p.id)}
  {@const formatted = p.price.toLocaleString('ko-KR')}   <!-- 이 블록 안에서만 쓰는 상수 -->
  <li>{p.name} · {formatted}원</li>
{/each}
```

`{@const}`는 `{#if}`, `{#each}`, `{:then}` 등의 블록 **바로 아래**에서만 쓸 수 있습니다.

---

## 3. 목록 + 상태: 할 일 앱 (`TodoList.svelte`)

```js
let todos = $state([{ id: 1, text: '...', done: false }])
let filter = $state('all')

const visible = $derived(filter === 'all' ? todos : todos.filter(...))
const remaining = $derived(todos.filter((t) => !t.done).length)

todos.push({ id: nextId++, text, done: false })     // 추가: push해도 화면 갱신
todos = todos.filter((t) => t.id !== id)            // 삭제: 새 배열로 교체해도 OK
```

```svelte
<input type="checkbox" bind:checked={todo.done} />   <!-- 항목 안의 값에 직접 bind -->
```

- **`bind:checked={todo.done}`** : `$state` 배열 안의 객체 속성에 바로 바인딩할 수 있습니다. 상태가 깊은 반응형이기 때문입니다.
- 필터 결과와 남은 개수는 모두 `$derived`입니다. 원본 `todos`만 정확히 유지하면 나머지는 자동입니다.
- `{:else}`로 "항목 없음" 메시지를 처리했고, 필터 버튼은 `class:selected`로 선택 표시를 합니다.

> **원본 배열을 정렬/변형할 때 주의**: `list.sort()`는 원본을 바꿉니다. `$derived` 안에서는 `[...list].sort()`처럼 **복사본**을 정렬하세요. (React의 `toSorted`/spread와 같은 이유)

---

## 4. 검색 · 필터 · 정렬 (`SearchList.svelte`)

```js
let query = $state('')
let category = $state('전체')
let sort = $state('name')

const results = $derived.by(() => {
  const q = query.trim().toLowerCase()
  const list = products.filter(
    (p) => (category === '전체' || p.category === category) && p.name.toLowerCase().includes(q),
  )
  return [...list].sort(...)
})
```

- 입력 세 개(`bind:value`)가 바뀔 때마다 `results`가 자동으로 다시 계산됩니다.
- **별도 "검색" 버튼이나 `useEffect` 없이** 입력 → 상태 → 파생값 → 화면이 한 줄로 이어집니다.
- 결과가 0개일 때 `{:else}`로 검색어가 포함된 안내 문구를 보여 줍니다. (studyFinal 게시판 검색의 기초)

---

## 5. Vue / React와 비교

| 항목 | React | Vue 3 | Svelte 5 |
|---|---|---|---|
| 조건 | `{cond && <A/>}` / 삼항 | `v-if` / `v-else-if` / `v-else` | `{#if}` / `{:else if}` / `{:else}` |
| 목록 | `arr.map(x => <li key>)` | `v-for` + `:key` | `{#each arr as x (key)}` |
| 빈 목록 처리 | `arr.length ? ... : ...` 직접 | `v-if="!arr.length"` 따로 | `{:else}` 한 블록 |
| 클래스 토글 | `className={cond ? 'a' : ''}` | `:class="{ a: cond }"` | `class:a={cond}` |
| 스타일 한 속성 | `style={{ color }}` | `:style="{ color }"` | `style:color={color}` |
| 블록 지역 변수 | 함수 안 `const` | `v-for` 안 계산 속성 어려움 | `{@const}` |
| 필터링된 목록 | `useMemo` 또는 렌더 중 계산 | `computed` | `$derived` |

---

## 6. TypeScript 버전 메모

```ts
type Filter = 'all' | 'active' | 'done'            // 문자열 리터럴 유니온
const filters: Filter[] = ['all', 'active', 'done']
let filter = $state<Filter>('all')
```

```svelte
{#each filters as f}                               <!-- ['all', ...] 를 직접 쓰면 f가 string이라 대입 시 에러 -->
  <button onclick={() => (filter = f)}>...</button>
{/each}
```

- 허용된 값만 가지는 상태는 **유니온 타입**으로 선언하면 `filter = 'dnoe'` 같은 오타를 `npm run check`가 잡아 줍니다.
- 목록 항목은 `interface Todo`로 선언하고 `$state<Todo[]>(...)`로 연결합니다.

---

## 7. 자주 하는 실수

1. **key 누락** → 입력 중인 폼이나 체크 상태가 엉뚱한 항목을 따라감
2. **key를 `index`로 사용** → 순서가 바뀌면 key가 없는 것과 같은 문제
3. **`$derived` 안에서 `sort()`** → 원본 배열이 바뀜. `[...list].sort()` 사용
4. **`{#if}`로 가린 컴포넌트의 상태 유지를 기대** → 조건이 거짓이 되면 컴포넌트가 **파괴**되어 상태가 초기화됨 (상태를 유지하려면 부모로 올리거나 공유 상태 사용 → study6)
5. **`{@const}`를 일반 마크업 사이에 사용** → 블록의 직접 자식 위치에만 가능

## 확인 문제

1. `{#each}`의 `{:else}`는 언제 렌더링되는가?
2. key가 없는 목록에서 순서를 뒤집으면 입력창의 글이 어떻게 되는가? 왜 그런가?
3. `bind:checked={todo.done}`이 `$state` 배열 안의 객체에서 동작하는 이유는?
4. 검색·필터·정렬 결과는 왜 `$effect`가 아니라 `$derived`로 만드는가?
5. `{#if}`가 거짓일 때와 `display: none`일 때의 차이는?

## 직접 해보기

- `TodoList`에 "완료 항목 모두 삭제" 버튼을 추가하고, 완료 항목이 없으면 비활성화하기
- `SearchList`에 "품절만 보기" 체크박스를 추가해 보기 (상품에 `soldOut` 필드 추가)
- `KeyDemo`에서 key를 `item.name`으로 바꿔 보고, 이름이 중복되면 어떤 일이 생기는지 확인하기
