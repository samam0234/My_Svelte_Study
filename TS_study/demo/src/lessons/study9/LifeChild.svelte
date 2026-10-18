<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { log } from './lib/lifelog.svelte.js'

  let { name }: { name: string } = $props()
  let count = $state(0)

  // 1) <script lang="ts"> 최상위 코드: 컴포넌트가 "만들어지는" 순간 (아직 DOM에 붙기 전)
  log(`① <script lang="ts"> 실행 — 컴포넌트 생성`)

  // 2) onMount : DOM에 붙은 직후 1회. 반환한 함수는 컴포넌트가 사라질 때 호출
  onMount(() => {
    log(`② onMount — 화면에 붙음`)
    return () => log(`④ onMount의 cleanup`)
  })

  // 3) $effect : DOM 갱신 후 실행. 안에서 읽은 상태가 바뀔 때마다 다시 실행된다
  //    (cleanup은 "다시 실행되기 직전"과 "컴포넌트가 사라질 때" 두 경우에 호출된다)
  $effect(() => {
    const current = count // cleanup에서 "이번 실행의 값"을 쓰려면 지역 변수에 잡아 둔다
    log(`③ $effect 실행 (count=${current})`)
    return () => log(`⑤ $effect cleanup (count=${current})`)
  })

  // 4) onDestroy : 사라질 때 호출 (서버 렌더링에서도 호출되는 유일한 생명주기)
  onDestroy(() => log(`⑥ onDestroy`))
</script>

<div class="child">
  <strong>{name}</strong>
  <button onclick={() => count++}>count {count}</button>
</div>

<style>
  .child { display: flex; gap: 0.6rem; align-items: center; padding: 0.4rem 0.8rem; border: 1px dashed var(--accent); border-radius: 8px; }
</style>
