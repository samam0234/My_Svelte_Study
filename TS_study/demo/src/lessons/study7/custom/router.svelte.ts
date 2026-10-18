import type { Component } from 'svelte'

// ── 직접 만드는 해시 라우터의 핵심 ──────────────────────────────────
// 1) 주소창의 #뒤 문자열을 읽어서 path / query 상태로 만든다.
// 2) 패턴('/users/:id')과 path를 비교해서 어떤 페이지인지, 파라미터가 무엇인지 계산한다.
// 3) hashchange 이벤트가 오면 다시 읽는다.

/** 패턴과 경로를 비교해 파라미터 객체를 돌려준다. 맞지 않으면 null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const names: string[] = []
  const source = pattern
    .replace(/\/:([^/]+)/g, (_, name) => {
      names.push(name)
      return '/([^/]+)'
    })
    .replace(/\*/g, '.*')
  const result = new RegExp(`^${source}/?$`).exec(path)
  if (!result) return null

  const params: Record<string, string> = {}
  names.forEach((name, i) => {
    params[name] = decodeURIComponent(result[i + 1])
  })
  return params
}

/** location.hash('#/users/3?tab=posts')를 읽어서 { path, query }로 나눈다. */
export function readHash(): { path: string; query: URLSearchParams } {
  const raw = location.hash.slice(1) || '/'
  const i = raw.indexOf('?')
  const path = i < 0 ? raw : raw.slice(0, i)
  return {
    path: path.startsWith('/') ? path : '/' + path,
    query: new URLSearchParams(i < 0 ? '' : raw.slice(i + 1)),
  }
}

class RouterState {
  path = $state('/')
  query = $state(new URLSearchParams())

  constructor() {
    this.sync()
  }

  // 주소창의 현재 해시를 상태에 반영
  sync() {
    const { path, query } = readHash()
    this.path = path
    this.query = query
  }
}

export const router = new RouterState()

/** 라우트 한 칸의 모양. guard가 문자열을 돌려주면 그 경로로 리다이렉트한다. */
export interface Route {
  path: string
  component: Component<any>
  guard?: () => string | null
}

/** 프로그램으로 이동. replace: true면 뒤로가기 기록을 남기지 않는다. */
export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  if (replace) {
    history.replaceState(null, '', '#' + to)
    router.sync() // replaceState는 hashchange를 발생시키지 않으므로 직접 동기화
  } else {
    location.hash = to // hashchange 이벤트가 발생 → RouterView가 sync()
  }
}
