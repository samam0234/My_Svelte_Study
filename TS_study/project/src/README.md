# src — 게시판 소스 (TS)

미니 게시판이 브라우저에서 실행하는 코드입니다.

- 저장소 전체: [README.md](../../../README.md)
- 상위 폴더: [README.md](../README.md)
- studyFinal 문서: [studyFinal.md](../../../studyFinal.md)

## 목적

라우트, 재사용 조각, 화면과 무관한 로직, 테스트를 나눕니다. `main.ts`이 `app.css`를 읽고 `App.svelte`를 `#app`에 `mount`합니다.

## 구성

| 경로 | 기능 |
|---|---|
| `main.ts` | 시작점 |
| `app.css` | 게시판이 공유하는 색, 글자, 폼, 여백 |
| `App.svelte` | 라우트 표, `Header`, `Router`, `Toast`. `/write`와 `/posts/:id/edit`는 `wrap({ conditions })`로 로그인을 요구. 실패하면 로그인으로 `replace` |
| [lib](./lib/README.md) | API, 인증, 토스트, 저장, 문자열, 리다이렉트 |
| [components](./components/README.md) | 헤더, 검색, 목록, 페이지, 폼, 토스트 |
| [routes](./routes/README.md) | 주소별 페이지 |
| [tests](./tests/README.md) | 단위·컴포넌트·통합 테스트 |

스크립트는 `<script lang="ts">`이고, 상태 모듈 확장자는 `.svelte.ts`입니다. JavaScript 소스는 `JS_study/project/src/`입니다.
