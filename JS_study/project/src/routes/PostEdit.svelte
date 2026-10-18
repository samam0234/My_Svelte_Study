<script>
  import { push } from 'svelte-spa-router'
  import { getPost, updatePost } from '../lib/api.js'
  import { auth } from '../lib/auth.svelte.js'
  import { createResource } from '../lib/resource.svelte.js'
  import { notify } from '../lib/toast.svelte.js'
  import PostForm from '../components/PostForm.svelte'

  let { params } = $props()

  const post = createResource((id, signal) => getPost(id, { signal }))

  $effect(() => {
    post.load(params.id)
    return () => post.abort()
  })

  const isAuthor = $derived(!!auth.user && !!post.data && auth.user.username === post.data.author)

  async function submit(values) {
    await updatePost(params.id, values, auth.user)
    notify('글을 수정했습니다.', 'success')
    push(`/posts/${params.id}`)
  }
</script>

<svelte:head><title>글 수정 · 미니 게시판</title></svelte:head>

<h1>글 수정</h1>

{#if post.error}
  <p class="error" role="alert">⚠️ {post.error.message}</p>
{:else if post.data}
  {#if isAuthor}
    <!-- 데이터가 도착한 뒤에 폼을 만들기 때문에, 폼은 처음부터 기존 글 내용으로 시작한다 -->
    <PostForm initial={{ title: post.data.title, content: post.data.content }} submitLabel="수정 완료" onsubmit={submit} cancelHref="#/posts/{params.id}" />
  {:else}
    <p class="error" role="alert">작성자만 수정할 수 있습니다.</p>
    <a href="#/posts/{params.id}">← 글로 돌아가기</a>
  {/if}
{:else}
  <p class="muted" role="status">불러오는 중…</p>
{/if}

<style>
  h1 { font-size: 1.4rem; }
</style>
