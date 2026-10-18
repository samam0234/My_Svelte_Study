<script>
  // npm install svelte-spa-router  (Svelte 5 전용 v5)
  import Router, { link, replace, router } from 'svelte-spa-router'
  import active from 'svelte-spa-router/active'
  import { wrap } from 'svelte-spa-router/wrap'
  import { auth } from '../auth.svelte.js'
  import Home from '../pages/Home.svelte'
  import Users from '../pages/Users.svelte'
  import UserDetail from '../pages/UserDetail.svelte'
  import Admin from '../pages/Admin.svelte'
  import Login from '../pages/Login.svelte'
  import NotFound from '../pages/NotFound.svelte'

  // 라우트 정의는 { '경로 패턴': 컴포넌트 } 객체. 위에서부터 첫 번째로 맞는 것이 선택된다.
  const routes = {
    '/': Home,
    '/users': Users,
    '/users/:id': UserDetail, // 컴포넌트는 params prop으로 { id } 를 받는다
    '/login': Login,
    // wrap + conditions : 모든 조건 함수가 true를 돌려줘야 이동할 수 있다 (라우트 가드)
    '/admin': wrap({ component: Admin, conditions: [() => auth.user !== null] }),
    '*': NotFound, // catch-all : 반드시 마지막
  }

  // 조건이 실패했을 때 호출된다 → 로그인 화면으로 보냄
  function onConditionsFailed() {
    replace('/login')
  }
</script>

<div class="demo">
  <nav class="row">
    <!-- use:link  : href="/users" 를 "#/users" 로 바꾸고 클릭을 가로채 준다
         use:active : 현재 경로와 맞으면 active 클래스를 붙여 준다
         (주의: '/users/*' 는 '/users' 자체에는 맞지 않는다. /users 와 /users/2 모두 켜려면 정규식을 쓴다) -->
    <a href="/" use:link use:active={{ path: '/', className: 'active' }}>홈</a>
    <a href="/users" use:link use:active={/^\/users/}>사용자</a>
    <a href="/admin" use:link use:active>관리자</a>
    <span class="muted">현재 경로: <code class="current">{router.location}</code></span>
  </nav>
  <div class="view">
    <Router {routes} {onConditionsFailed} />
  </div>
</div>

<style>
  .demo { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  nav { padding: 0.5rem 0.8rem; background: var(--accent-soft); }
  nav a { padding: 0.3rem 0.7rem; border-radius: 6px; text-decoration: none; color: inherit; }
  nav a:hover { background: var(--bg); }
  /* use:active가 붙이는 클래스는 이 컴포넌트가 만든 요소가 아니라 라우터가 직접 붙이므로 :global이 필요 */
  nav :global(a.active) { background: var(--accent); color: white; }
  .view { padding: 0.8rem 1rem; }
</style>
