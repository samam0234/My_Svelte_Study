<script lang="ts">
  interface Todo {
    id: number
    text: string
    done: boolean
  }
  // 문자열 리터럴 유니온 타입: 이 3가지 값만 허용 → 오타를 컴파일 전에 잡는다.
  type Filter = 'all' | 'active' | 'done'
  const filters: Filter[] = ['all', 'active', 'done']

  let todos = $state<Todo[]>([
    { id: 1, text: 'Svelte 설치하기', done: true },
    { id: 2, text: '$state 익히기', done: true },
    { id: 3, text: '리스트 렌더링 연습', done: false },
  ])
  let nextId = 4
  let text = $state('')
  let filter = $state<Filter>('all')

  // 파생 값: 필터 결과와 남은 개수는 todos/filter가 바뀌면 자동으로 갱신된다.
  const visible = $derived(
    filter === 'all' ? todos : todos.filter((t) => (filter === 'done' ? t.done : !t.done)),
  )
  const remaining = $derived(todos.filter((t) => !t.done).length)

  function add() {
    const v = text.trim()
    if (!v) return
    todos.push({ id: nextId++, text: v, done: false })
    text = ''
  }

  function remove(id: number) {
    todos = todos.filter((t) => t.id !== id)
  }
</script>

<section class="card">
  <h3>3. {'{#each}'} — 할 일 목록</h3>

  <form
    class="row"
    onsubmit={(e) => {
      e.preventDefault()
      add()
    }}
  >
    <input bind:value={text} placeholder="할 일을 입력" />
    <button type="submit">추가</button>
  </form>

  <div class="row filters">
    {#each filters as f}
      <button class:selected={filter === f} onclick={() => (filter = f)}>
        {f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료'}
      </button>
    {/each}
    <span class="muted">남은 일 {remaining}개</span>
  </div>

  <ul>
    <!-- (todo.id) 가 key. 항목을 식별하는 값을 지정하면 추가/삭제/순서 변경 때 DOM을 정확히 재사용한다. -->
    {#each visible as todo, i (todo.id)}
      <li class:done={todo.done}>
        <span class="muted">{i + 1}.</span>
        <label>
          <input type="checkbox" bind:checked={todo.done} />
          <span class="text">{todo.text}</span>
        </label>
        <button onclick={() => remove(todo.id)} aria-label="삭제">✕</button>
      </li>
    {:else}
      <!-- 목록이 비어 있을 때만 렌더링되는 {:else} -->
      <li class="muted">표시할 항목이 없습니다.</li>
    {/each}
  </ul>
</section>

<style>
  ul { list-style: none; padding: 0; margin: 0.6rem 0 0; display: grid; gap: 0.3rem; }
  li { display: flex; gap: 0.5rem; align-items: center; }
  li label { flex: 1; display: flex; gap: 0.4rem; align-items: center; }
  li.done .text { text-decoration: line-through; color: var(--muted); }
  .filters { margin-top: 0.6rem; }
  .selected { border-color: var(--accent); background: var(--accent-soft); }
</style>
