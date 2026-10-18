<script>
  import Router, { replace } from 'svelte-spa-router'
  import { wrap } from 'svelte-spa-router/wrap'
  import Header from './components/Header.svelte'
  import Toast from './components/Toast.svelte'
  import Home from './routes/Home.svelte'
  import PostDetail from './routes/PostDetail.svelte'
  import PostWrite from './routes/PostWrite.svelte'
  import PostEdit from './routes/PostEdit.svelte'
  import Login from './routes/Login.svelte'
  import NotFound from './routes/NotFound.svelte'
  import { auth } from './lib/auth.svelte.js'

  // 라우트 가드 : 로그인한 사람만 통과
  const requireLogin = () => auth.isLoggedIn

  const routes = {
    '/': Home,
    '/posts/:id': PostDetail,
    '/posts/:id/edit': wrap({ component: PostEdit, conditions: [requireLogin] }),
    '/write': wrap({ component: PostWrite, conditions: [requireLogin] }),
    '/login': Login,
    '*': NotFound,
  }

  // 가드에 막히면 로그인 화면으로 보낸다. 로그인 후 원래 가려던 곳으로 돌아오도록 redirect를 함께 넘긴다.
  function onConditionsFailed(detail) {
    replace(`/login?redirect=${encodeURIComponent(detail.location)}`)
  }
</script>

<Header />
<main>
  <Router {routes} {onConditionsFailed} />
</main>
<Toast />

<style>
  main { max-width: 760px; margin: 0 auto; padding: 1.5rem 1.2rem 4rem; }
</style>
