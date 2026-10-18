// study10 화면에 보여 줄 정적 데이터

export interface TestRow {
  study: string
  file: string
  checks: string
}

export interface KitRow {
  spa: string
  kit: string
  note: string
}

// 어떤 테스트가 어떤 study 내용을 검증하는지 한눈에 보는 지도
export const testMap: TestRow[] = [
  { study: 'study2', file: 'Counter.test.js', checks: '컴포넌트 렌더링, 클릭 이벤트, 상태 변화' },
  { study: 'study3', file: 'Stepper.test.js', checks: 'props, 콜백 props, rerender, 경계값(disabled)' },
  { study: 'study4', file: 'TodoList.test.js', checks: '리스트 추가·삭제·필터, 빈 상태' },
  { study: 'study6', file: 'cart.svelte.test.js', checks: '룬을 쓰는 클래스(.svelte.js) 단위 테스트, localStorage 저장·복원' },
  { study: 'study7', file: 'matchPath.test.js · router.test.js', checks: '순수 함수 테스트, 해시 라우팅·가드·로그아웃 경쟁 상태' },
  { study: 'study8', file: 'resource.svelte.test.js · PostManager.test.js', checks: '요청 취소(최신 응답만 반영), 폼 검증, 낙관적 업데이트와 롤백' },
  { study: 'study9', file: 'actions.test.js', checks: '액션의 update / destroy, 리스너 정리' },
  { study: '전체', file: 'lessons.smoke.test.js', checks: '모든 실습 화면이 오류 없이 마운트되는지(스모크 테스트)' },
]

// 지금까지 만든 SPA 개념이 SvelteKit에서는 어떻게 바뀌는지
export const kitMap: KitRow[] = [
  { spa: '해시 라우터 (#/users/2)', kit: '파일 기반 라우팅 — src/routes/users/[id]/+page.svelte', note: '히스토리 라우팅, 새로고침해도 서버가 알맞은 페이지를 응답' },
  { spa: 'onMount 안의 fetch', kit: '+page.js / +page.server.js 의 load() 함수', note: '화면이 그려지기 전에 데이터 준비, 서버 렌더링(SSR) 가능' },
  { spa: 'bind:value + fetch POST', kit: '+page.server.js 의 form actions + use:enhance', note: 'JS가 꺼져 있어도 동작하는 폼(점진적 향상)' },
  { spa: 'wrap({ conditions }) 가드', kit: 'hooks.server.js / +layout.server.js 에서 검사', note: '서버에서 인증 → 보호 페이지의 데이터가 아예 전송되지 않음' },
  { spa: '.svelte.js 전역 상태', kit: 'context 또는 서버가 주는 data (SSR에서는 전역 변수 공유 주의)', note: '요청마다 상태가 섞이지 않게 설계' },
  { spa: 'JSONPlaceholder 호출', kit: '+server.js 로 우리 서버 API 작성', note: '프런트와 백엔드를 한 프로젝트에서' },
  { spa: 'npm run build → dist/', kit: 'adapter (static / node / vercel / cloudflare ...)', note: '배포 대상에 맞는 어댑터를 선택' },
]
