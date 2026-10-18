<script>
  import { push, router } from 'svelte-spa-router'
  import { listPosts } from '../lib/api.js'
  import { createResource } from '../lib/resource.svelte.js'
  import SearchBar from '../components/SearchBar.svelte'
  import PostList from '../components/PostList.svelte'
  import Pagination from '../components/Pagination.svelte'

  // ── 검색 상태의 "진짜 원본"은 주소(#/?q=svelte&page=2) ──────────────────────
  // 주소에 두면: 새로고침해도 유지, 뒤로가기 동작, 링크로 공유 가능.
  // 컴포넌트는 주소에서 q, page를 "파생"해서 쓴다 (study2의 $derived).
  const params = $derived(new URLSearchParams(router.querystring ?? ''))
  const q = $derived(params.get('q') ?? '')
  const page = $derived(Math.max(1, Number(params.get('page')) || 1))

  const list = createResource(({ q, page }, signal) => listPosts({ q, page, signal }))

  // q나 page가 바뀔 때마다 다시 불러온다. 정리 함수에서 이전 요청을 취소한다 (study8)
  $effect(() => {
    list.load({ q, page })
    return () => list.abort()
  })

  // 상태 → 주소. 값이 기본값(빈 검색어, 1페이지)이면 주소에서 생략해 깔끔하게 유지.
  function pathFor({ q: nextQ = q, page: nextPage = 1 } = {}) {
    const query = new URLSearchParams()
    if (nextQ) query.set('q', nextQ)
    if (nextPage > 1) query.set('page', String(nextPage))
    const text = query.toString()
    return text ? `/?${text}` : '/'
  }
</script>

<svelte:head><title>{q ? `"${q}" 검색` : '글 목록'} · 미니 게시판</title></svelte:head>

<div class="head">
  <h1>글 목록</h1>
  {#if list.data}<span class="muted">총 {list.data.total}건</span>{/if}
</div>

<!-- 검색하면 1페이지부터 다시 보도록 page를 1로 -->
<SearchBar value={q} onsearch={(text) => push(pathFor({ q: text, page: 1 }))} />

{#if list.error}
  <p class="error" role="alert">
    ⚠️ {list.error.message}
    <button onclick={() => list.load({ q, page })}>다시 시도</button>
  </p>
{:else if list.data}
  <!-- 새 결과를 기다리는 동안에도 이전 목록을 흐리게 보여 준다: 화면이 깜빡이며 비는 것을 막는다 -->
  <div class:stale={list.loading} aria-busy={list.loading}>
    <PostList posts={list.data.items} {q} />
    <Pagination page={list.data.page} totalPages={list.data.totalPages} hrefFor={(p) => '#' + pathFor({ page: p })} />
  </div>
{:else}
  <p class="muted" role="status">불러오는 중…</p>
{/if}

<style>
  .head { display: flex; align-items: baseline; gap: 0.8rem; margin-bottom: 0.6rem; }
  .head h1 { margin: 0; font-size: 1.4rem; }
  .stale { opacity: 0.5; transition: opacity 0.15s; }
</style>
