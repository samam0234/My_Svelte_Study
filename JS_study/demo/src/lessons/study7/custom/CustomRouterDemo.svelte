<script>
  import RouterView from './RouterView.svelte'
  import NavLink from './NavLink.svelte'
  import { router } from './router.svelte.js'
  import { auth } from '../auth.svelte.js'
  import Home from '../pages/Home.svelte'
  import Users from '../pages/Users.svelte'
  import UserDetail from '../pages/UserDetail.svelte'
  import Admin from '../pages/Admin.svelte'
  import Login from '../pages/Login.svelte'
  import NotFound from '../pages/NotFound.svelte'

  // 라우트 표: 위에서부터 차례로 비교한다.
  const routes = [
    { path: '/', component: Home },
    { path: '/users', component: Users },
    { path: '/users/:id', component: UserDetail },
    { path: '/login', component: Login },
    // guard: 로그인하지 않았다면 '/login'으로 보낸다 (null이면 통과)
    { path: '/admin', component: Admin, guard: () => (auth.user ? null : '/login') },
  ]
</script>

<div class="demo">
  <nav class="row">
    <NavLink to="/" exact>홈</NavLink>
    <NavLink to="/users">사용자</NavLink>
    <NavLink to="/admin">관리자</NavLink>
    <span class="muted">현재 경로: <code class="current">{router.path}</code></span>
  </nav>
  <div class="view">
    <RouterView {routes} fallback={NotFound} />
  </div>
</div>

<style>
  .demo { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  nav { padding: 0.5rem 0.8rem; background: var(--accent-soft); }
  .view { padding: 0.8rem 1rem; }
</style>
