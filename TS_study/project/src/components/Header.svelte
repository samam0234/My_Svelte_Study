<script lang="ts">
  import { link, push } from 'svelte-spa-router'
  import active from 'svelte-spa-router/active'
  import { auth } from '../lib/auth.svelte.js'
  import { notify } from '../lib/toast.svelte.js'

  function logout() {
    auth.logout()
    notify('로그아웃했습니다.')
    push('/')
  }
</script>

<header>
  <a class="brand" href="/" use:link>📋 미니 게시판</a>

  <nav aria-label="주요 메뉴">
    <!-- 홈은 '/' 와 글 상세('/posts/..')에서도 켜지도록 정규식 사용 -->
    <a href="/" use:link use:active={{ path: /^\/($|posts\/\d+$)/ }}>목록</a>
    <a href="/write" use:link use:active>글쓰기</a>
  </nav>

  <div class="user">
    {#if auth.user}
      <span><strong>{auth.user.name}</strong>님</span>
      <button onclick={logout}>로그아웃</button>
    {:else}
      <a href="/login" use:link use:active>로그인</a>
    {/if}
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 0.7rem 1.2rem;
    border-bottom: 1px solid var(--line);
    background: var(--panel);
    flex-wrap: wrap;
  }
  .brand { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: var(--text); }
  nav { display: flex; gap: 0.3rem; flex: 1; }
  nav a, .user a { padding: 0.3rem 0.7rem; border-radius: 6px; text-decoration: none; color: inherit; }
  nav a:hover, .user a:hover { background: var(--accent-soft); }
  /* use:active 가 붙이는 클래스는 라우터가 직접 DOM에 넣기 때문에 :global 이 필요하다 (study7) */
  header :global(a.active) { background: var(--accent); color: #fff; }
  .user { display: flex; align-items: center; gap: 0.6rem; }
</style>
