<script lang="ts">
  import { push } from 'svelte-spa-router'
  import { getPost, deletePost, type Post } from '../lib/api.js'
  import { auth } from '../lib/auth.svelte.js'
  import { createResource } from '../lib/resource.svelte.js'
  import { notify } from '../lib/toast.svelte.js'
  import { formatDate } from '../lib/text.js'

  // svelte-spa-router가 주소의 :id 를 params prop으로 넘겨 준다 (study7)
  let { params }: { params: { id: string } } = $props()

  const post = createResource<Post, string>((id, signal) => getPost(id, { signal }))

  let confirming = $state(false) // "정말 삭제할까요?" 단계
  let deleting = $state(false)

  $effect(() => {
    confirming = false // 다른 글로 이동하면 확인 단계를 닫는다
    post.load(params.id)
    return () => post.abort()
  })

  // 작성자만 수정/삭제 버튼을 보여 준다. (화면에서 숨기는 것은 편의일 뿐 — 실제 권한 검사는 서버(api)가 한다)
  const isAuthor = $derived(!!auth.user && !!post.data && auth.user.username === post.data.author)

  async function remove() {
    deleting = true
    try {
      await deletePost(params.id, auth.user)
      notify('글을 삭제했습니다.', 'success')
      push('/')
    } catch (e) {
      notify(e instanceof Error ? e.message : '삭제하지 못했습니다.', 'error')
      confirming = false
    } finally {
      deleting = false
    }
  }
</script>

<svelte:head><title>{post.data?.title ?? '게시글'} · 미니 게시판</title></svelte:head>

{#if post.error}
  <div role="alert">
    <h1>😕 글을 불러오지 못했습니다</h1>
    <p class="error">{post.error.message}</p>
    <a href="#/">← 목록으로</a>
  </div>
{:else if post.data}
  <article>
    <h1>{post.data.title}</h1>
    <p class="meta muted">
      {post.data.authorName} · {formatDate(post.data.createdAt)} · 조회 {post.data.views}
    </p>

    <!-- 사용자 입력은 {…} 보간으로 출력한다. 자동으로 이스케이프되어 <script lang="ts">가 있어도 글자로만 보인다 -->
    <p class="content">{post.data.content}</p>

    <div class="row actions">
      <a href="#/">← 목록</a>
      {#if isAuthor}
        <a href="#/posts/{post.data.id}/edit">수정</a>
        {#if confirming}
          <span class="confirm">정말 삭제할까요?</span>
          <button class="danger" onclick={remove} disabled={deleting}>{deleting ? '삭제 중…' : '삭제 확인'}</button>
          <button onclick={() => (confirming = false)} disabled={deleting}>취소</button>
        {:else}
          <button onclick={() => (confirming = true)}>삭제</button>
        {/if}
      {/if}
    </div>
  </article>
{:else}
  <p class="muted" role="status">불러오는 중…</p>
{/if}

<style>
  h1 { font-size: 1.5rem; margin-bottom: 0.3rem; }
  .meta { margin: 0 0 1.2rem; }
  .content { white-space: pre-wrap; line-height: 1.8; padding: 1rem 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .actions { margin-top: 1rem; }
  .confirm { color: crimson; font-weight: 600; }
</style>
