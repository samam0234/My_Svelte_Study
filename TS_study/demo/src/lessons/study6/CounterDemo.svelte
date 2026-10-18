<script lang="ts">
  import { counter, increment, reset, createCounter } from './lib/counter.svelte.js'

  // 팩토리: 이 컴포넌트 전용 독립 카운터
  const local = createCounter(10)
</script>

<section class="card">
  <h3>1. 모듈 상태 / 팩토리 — 컴포넌트 밖에서 상태 공유</h3>

  <div class="cols">
    <div class="box">
      <p class="muted">공유 카운터 (패널 A)</p>
      <div class="row"><strong class="shared-a">{counter.count}</strong><button onclick={increment}>+1</button></div>
    </div>
    <div class="box">
      <p class="muted">공유 카운터 (패널 B)</p>
      <div class="row"><strong class="shared-b">{counter.count}</strong><button onclick={() => counter.count--}>-1</button><button onclick={reset}>리셋</button></div>
    </div>
    <div class="box">
      <p class="muted">팩토리로 만든 독립 카운터</p>
      <div class="row">
        <strong class="local">{local.count}</strong>
        <span class="muted">(×2 = {local.double})</span>
        <button onclick={local.increment}>+1</button>
        <button onclick={local.reset}>리셋</button>
      </div>
    </div>
  </div>
  <p class="muted">A와 B는 서로 다른 DOM이지만 같은 <code>counter</code> 객체를 읽는다. props도, 부모도 필요 없다.</p>
</section>

<style>
  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.8rem; }
  .box { border: 1px dashed var(--line); border-radius: 8px; padding: 0.6rem 0.8rem; }
  .box p { margin: 0 0 0.3rem; }
</style>
