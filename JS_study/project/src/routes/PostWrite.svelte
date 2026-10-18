<script>
  import { push } from 'svelte-spa-router'
  import { createPost } from '../lib/api.js'
  import { auth } from '../lib/auth.svelte.js'
  import { notify } from '../lib/toast.svelte.js'
  import PostForm from '../components/PostForm.svelte'

  // PostForm이 검증을 통과시킨 값만 여기로 온다. 던진 오류는 PostForm이 폼 아래에 보여 준다.
  async function submit(values) {
    const post = await createPost(values, auth.user)
    notify('글을 등록했습니다.', 'success')
    push(`/posts/${post.id}`)
  }
</script>

<svelte:head><title>글쓰기 · 미니 게시판</title></svelte:head>

<h1>글쓰기</h1>
<PostForm submitLabel="등록" onsubmit={submit} />

<style>
  h1 { font-size: 1.4rem; }
</style>
