<script>
  // page / totalPages : 현재/전체 페이지,  hrefFor(p) : p번 페이지로 가는 주소를 만들어 주는 함수
  let { page, totalPages, hrefFor } = $props()

  // 현재 페이지 주변 최대 5개만 보여 준다: 1 2 [3] 4 5
  const pages = $derived.by(() => {
    const size = 5
    let start = Math.max(1, page - Math.floor(size / 2))
    const end = Math.min(totalPages, start + size - 1)
    start = Math.max(1, end - size + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })
</script>

{#if totalPages > 1}
  <nav aria-label="페이지 이동">
    {#if page > 1}
      <a href={hrefFor(page - 1)} rel="prev">이전</a>
    {:else}
      <span class="off" aria-disabled="true">이전</span>
    {/if}

    {#each pages as p (p)}
      <a href={hrefFor(p)} class:current={p === page} aria-current={p === page ? 'page' : undefined}>{p}</a>
    {/each}

    {#if page < totalPages}
      <a href={hrefFor(page + 1)} rel="next">다음</a>
    {:else}
      <span class="off" aria-disabled="true">다음</span>
    {/if}
  </nav>
{/if}

<style>
  nav { display: flex; justify-content: center; gap: 0.3rem; margin-top: 1.2rem; }
  a, .off { min-width: 2.2rem; text-align: center; padding: 0.3rem 0.6rem; border: 1px solid var(--line); border-radius: 6px; text-decoration: none; color: var(--text); }
  a:hover { border-color: var(--accent); }
  .current { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
  .off { color: var(--muted); opacity: 0.5; }
</style>
