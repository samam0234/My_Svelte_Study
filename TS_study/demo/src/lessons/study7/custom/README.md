# study7/custom — 직접 만든 해시 라우터

`location.hash`를 읽어 페이지를 고르는 라우터입니다. 라이브러리를 쓰지 않습니다.

- 저장소 전체: [README.md](../../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study7 문서: [study7.md](../../../../../../study7.md)

## 목적

라우터가 하는 일(패턴 매칭, 이동, 활성 링크, 가드)을 코드로 보이게 합니다. `/admin`은 로그인한 경우만 통과하고, 아니면 `#/login`으로 보냅니다. 로그아웃 직후 가드의 리다이렉트와 주소 변경이 겹치면 홈으로 가야 하며, 로그인 화면에 남으면 안 됩니다.

## 파일

| 파일 | 기능 |
|---|---|
| `router.svelte.ts` | `readHash`, `matchPath(pattern, path)`, `RouterState`, `navigate`. 현재 주소가 상태 |
| `RouterView.svelte` | 라우트 표와 현재 해시를 보고 맞는 페이지를 그림 |
| `NavLink.svelte` | 해시로 이동. 현재 경로이면 `aria-current="page"` |
| `CustomRouterDemo.svelte` | 위 파일과 `pages/`를 조립한 데모. 테스트가 이 컴포넌트를 렌더 |

페이지 컴포넌트는 [../pages/README.md](../pages/README.md)에 있습니다.
