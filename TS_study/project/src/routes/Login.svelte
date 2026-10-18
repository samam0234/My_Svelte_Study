<script lang="ts">
  import { push, replace, router } from 'svelte-spa-router'
  import { auth } from '../lib/auth.svelte.js'
  import { notify } from '../lib/toast.svelte.js'
  import { safeRedirect } from '../lib/redirect.js'

  let username = $state('')
  let password = $state('')
  let submitting = $state(false)
  let error = $state('')

  // 보호된 페이지에서 튕겨 왔다면 ?redirect=/write 처럼 돌아갈 곳이 들어 있다.
  const redirect = $derived(safeRedirect(new URLSearchParams(router.querystring ?? '').get('redirect')))

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    if (!username.trim() || !password) {
      error = '아이디와 비밀번호를 입력하세요.'
      return
    }

    submitting = true
    error = ''
    try {
      await auth.login(username, password)
      notify(`${auth.user?.name}님, 환영합니다!`, 'success')
      // replace : 로그인 화면을 기록에 남기지 않는다 → 뒤로가기를 눌러도 로그인 화면으로 돌아오지 않음
      replace(redirect)
    } catch (err) {
      error = err instanceof Error ? err.message : '로그인하지 못했습니다.'
      password = ''
    } finally {
      submitting = false
    }
  }
</script>

<svelte:head><title>로그인 · 미니 게시판</title></svelte:head>

<h1>로그인</h1>

{#if auth.user}
  <p><strong>{auth.user.name}</strong>님은 이미 로그인되어 있습니다.</p>
  <button onclick={() => push('/')}>목록으로</button>
{:else}
  <form onsubmit={submit} novalidate>
    <label>아이디 <input bind:value={username} autocomplete="username" /></label>
    <label>비밀번호 <input type="password" bind:value={password} autocomplete="current-password" /></label>
    {#if error}<p class="error" role="alert">⚠️ {error}</p>{/if}
    <button type="submit" class="primary" disabled={submitting}>{submitting ? '확인 중…' : '로그인'}</button>
  </form>
  <p class="muted hint">데모 계정: <code>hong</code> / <code>kim</code> (비밀번호 <code>1234</code>)</p>
{/if}

<style>
  h1 { font-size: 1.4rem; }
  form { display: grid; gap: 0.8rem; max-width: 320px; }
  label { display: grid; gap: 0.3rem; font-weight: 600; }
  input { font-weight: 400; }
  .hint { margin-top: 1rem; }
</style>
