<script lang="ts">
  import type { Component } from 'svelte'
  import { router, matchPath, navigate, readHash, type Route } from './router.svelte.js'

  // routes : [{ path, component, guard? }]   guard()가 문자열을 돌려주면 그 경로로 보낸다 (접근 제한)
  // fallback: 어떤 경로와도 맞지 않을 때 보여 줄 컴포넌트
  interface Props {
    routes: Route[]
    fallback: Component<any>
  }

  let { routes, fallback }: Props = $props()

  // 현재 path와 맞는 첫 번째 라우트 (순서가 중요: 구체적인 것을 위에)
  const matched = $derived.by(() => {
    for (const route of routes) {
      const params = matchPath(route.path, router.path)
      if (params) return { route, params }
    }
    return null
  })

  // 가드: auth.user 같은 반응형 값을 읽으므로 로그아웃하면 자동으로 다시 계산된다.
  const redirectTo = $derived(matched?.route.guard?.() ?? null)

  // 렌더링할 컴포넌트. 리다이렉트 중이면 아무것도 그리지 않는다.
  const View = $derived(redirectTo ? null : (matched?.route.component ?? fallback))

  // 이동은 부수 효과이므로 $derived가 아니라 $effect에서 한다.
  $effect(() => {
    if (!redirectTo) return

    // 경쟁 상태 방지: 로그아웃 버튼처럼 "상태를 바꾸고 곧바로 다른 주소로 이동"하는 경우,
    // 주소창(location.hash)은 이미 바뀌었지만 hashchange 이벤트는 아직 도착하지 않았을 수 있다.
    // 이때 가드가 먼저 /login으로 보내 버리면 사용자가 가려던 곳이 무시된다. 그래서 이미 다른 곳으로
    // 이동 중이면 그쪽을 존중하고 가드의 리다이렉트는 건너뛴다.
    if (readHash().path !== router.path) return

    navigate(redirectTo, { replace: true })
  })
</script>

<!-- 주소창의 #부분이 바뀔 때마다 상태를 다시 읽는다. 컴포넌트가 사라지면 리스너도 자동으로 해제된다. -->
<svelte:window onhashchange={() => router.sync()} />

{#if View}
  <View params={matched?.params ?? {}} />
{/if}
