<script lang="ts">
  import { listPosts } from './lib/api.js'
  import { createResource } from './lib/resource.svelte.js'

  let userId = $state('') // '' = 전체
  let simulateError = $state(false)

  const posts = createResource(({ userId, fail }: { userId: string; fail: boolean }, signal) =>
    listPosts({ userId, fail, signal, limit: 4 }),
  )

  // userId / simulateError 가 바뀔 때마다 다시 불러온다.
  // cleanup(return)에서 abort() : 빠르게 여러 번 바꿔도 이전 요청은 취소되고 마지막 것만 남는다.
  $effect(() => {
    posts.load({ userId, fail: simulateError })
    return () => posts.abort()
  })
</script>

<section class="card">
  <h3>2. $effect + 요청 취소 — 필터가 바뀌면 다시 불러오기</h3>

  <div class="row">
    <label>작성자
      <select value={userId} onchange={(e) => (userId = e.currentTarget.value)}>
        <option value="">전체</option>
        {#each [1, 2, 3] as n}
          <option value={String(n)}>user {n}</option>
        {/each}
      </select>
    </label>
    <label><input type="checkbox" checked={simulateError} onchange={(e) => (simulateError = e.currentTarget.checked)} /> 오류 시뮬레이션</label>
    <button onclick={() => posts.load({ userId, fail: simulateError })}>다시 시도</button>
  </div>

  {#if posts.loading}
    <p class="status loading">불러오는 중…</p>
  {:else if posts.error}
    <p class="status error">⚠️ {posts.error.message}</p>
  {:else if posts.data}
    <ul>
      {#each posts.data as p (p.id)}
        <li><span class="muted">user {p.userId} · #{p.id}</span> {p.title}</li>
      {:else}
        <li class="muted">결과가 없습니다.</li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .status { margin: 0.8rem 0 0; }
  .error { color: crimson; }
  ul { list-style: none; padding: 0; margin: 0.8rem 0 0; display: grid; gap: 0.3rem; }
</style>
