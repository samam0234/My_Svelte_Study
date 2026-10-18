<script lang="ts">
  import { lessons } from './lessons/index'

  // ?lesson=study3 처럼 주소에 진도를 남겨서 새로고침해도 같은 화면이 열리게 한다.
  const params = new URLSearchParams(location.search)
  let currentId = $state<string>(params.get('lesson') ?? lessons[0].id)

  // $derived: currentId가 바뀌면 자동으로 다시 계산된다.
  const current = $derived(lessons.find((l) => l.id === currentId) ?? lessons[0])
  // 컴포넌트도 변수에 담아 <Lesson /> 처럼 바로 렌더링할 수 있다 (Svelte 5).
  const Lesson = $derived(current.component)

  function select(id: string) {
    currentId = id
    history.replaceState(null, '', `?lesson=${id}`)
  }
</script>

<div class="layout">
  <nav>
    <h1>Svelte 학습 <small>TS</small></h1>
    <ul>
      {#each lessons as lesson (lesson.id)}
        <li>
          <button class:active={lesson.id === current.id} onclick={() => select(lesson.id)}>
            {lesson.title}
          </button>
        </li>
      {/each}
    </ul>
  </nav>

  <main>
    <Lesson />
  </main>
</div>

<style>
  .layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
  nav { border-right: 1px solid var(--line); padding: 1rem; background: var(--panel); }
  nav h1 { font-size: 1.15rem; }
  nav small { color: var(--accent); font-size: 0.7em; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.3rem; }
  li button { width: 100%; text-align: left; }
  li button.active { border-color: var(--accent); background: var(--accent-soft); font-weight: 600; }
  main { padding: 1.5rem 2rem; max-width: 880px; }

  @media (max-width: 720px) {
    .layout { grid-template-columns: 1fr; }
    nav { border-right: none; border-bottom: 1px solid var(--line); }
  }
</style>
