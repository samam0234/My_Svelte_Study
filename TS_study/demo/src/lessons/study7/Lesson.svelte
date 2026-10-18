<script lang="ts">
  import CustomRouterDemo from './custom/CustomRouterDemo.svelte'
  import LibraryRouterDemo from './library/LibraryRouterDemo.svelte'

  // 두 라우터는 같은 주소창의 해시(#)를 쓰기 때문에 동시에 띄우지 않고 하나만 보여 준다.
  let mode = $state<'custom' | 'library'>('custom')
</script>

<h2>study7 · 고급 2 — 라우팅</h2>

<section class="card">
  <h3>해시(#) 라우팅 — 같은 화면을 두 가지 방법으로</h3>
  <div class="row" role="tablist">
    <button role="tab" aria-selected={mode === 'custom'} class:on={mode === 'custom'} onclick={() => (mode = 'custom')}>
      A. 직접 만든 라우터
    </button>
    <button role="tab" aria-selected={mode === 'library'} class:on={mode === 'library'} onclick={() => (mode = 'library')}>
      B. svelte-spa-router
    </button>
  </div>
  <p class="muted">
    주소창 끝의 <code>#/…</code> 가 바뀌는 것을 지켜보면서 링크를 눌러 보자. 새로고침해도 같은 화면이 열리고, 뒤로가기도 동작한다.
  </p>

  <!-- {#key}로 감싸면 mode가 바뀔 때마다 컴포넌트가 새로 만들어져서 이전 라우터의 리스너/상태가 확실히 정리된다 -->
  {#key mode}
    {#if mode === 'custom'}
      <CustomRouterDemo />
    {:else}
      <LibraryRouterDemo />
    {/if}
  {/key}
</section>

<style>
  .on { border-color: var(--accent); background: var(--accent-soft); font-weight: 600; }
</style>
