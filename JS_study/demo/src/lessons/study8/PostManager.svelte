<script>
  import { onMount } from 'svelte'
  import { listPosts, deletePost } from './lib/api.js'
  import { createResource } from './lib/resource.svelte.js'
  import PostForm from './PostForm.svelte'

  const list = createResource((_, signal) => listPosts({ limit: 5, signal }))
  let failing = $state(false) // 저장/삭제 요청을 일부러 실패시키기
  let notice = $state('')
  let localId = 1000

  // onMount : 컴포넌트가 화면에 붙은 직후 딱 한 번 실행. return하면 사라질 때 호출되는 cleanup.
  onMount(() => {
    list.load()
    return () => list.abort()
  })

  function created(post) {
    // 이 API는 항상 id 101을 돌려주고 저장도 안 하므로, 화면용으로 고유 id를 새로 붙여 맨 앞에 추가한다.
    list.data = [{ ...post, id: ++localId }, ...(list.data ?? [])]
    notice = `"${post.title}" 글을 등록했습니다.`
  }

  // 낙관적 업데이트(optimistic update):
  // 서버 응답을 기다리지 않고 먼저 화면에서 지운 뒤, 실패하면 원래대로 되돌린다.
  async function remove(post) {
    const before = list.data
    list.data = before.filter((p) => p.id !== post.id)
    notice = ''
    try {
      await deletePost(post.id, { fail: failing })
    } catch (e) {
      list.data = before // 롤백
      notice = `삭제에 실패해서 되돌렸습니다. (${e.message})`
    }
  }
</script>

<section class="card">
  <h3>3. 폼 + POST / DELETE — 검증, 전송 중 상태, 낙관적 업데이트</h3>

  <label class="row"><input type="checkbox" bind:checked={failing} /> 저장/삭제 요청 실패 시뮬레이션</label>

  <PostForm oncreated={created} fail={failing} />

  {#if notice}<p class="notice" role="status">{notice}</p>{/if}

  {#if list.loading}
    <p class="muted">목록을 불러오는 중…</p>
  {:else if list.error}
    <p class="error">⚠️ {list.error.message} <button onclick={() => list.load()}>다시 시도</button></p>
  {:else if list.data}
    <ul>
      {#each list.data as post (post.id)}
        <li>
          <span class="title">{post.title}</span>
          <button onclick={() => remove(post)} aria-label="삭제">삭제</button>
        </li>
      {:else}
        <li class="muted">글이 없습니다.</li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.3rem; }
  li { display: flex; gap: 0.6rem; align-items: center; justify-content: space-between; }
  .title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .notice { background: var(--accent-soft); padding: 0.4rem 0.7rem; border-radius: 6px; }
  .error { color: crimson; }
</style>
