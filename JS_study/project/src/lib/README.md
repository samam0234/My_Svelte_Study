# lib

화면을 모르는 게시판 로직입니다. 컴포넌트는 이 폴더의 함수와 스토어만 부릅니다.

- 저장소 전체: [README.md](../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- studyFinal 문서: [studyFinal.md](../../../../studyFinal.md)

## 목적

권한, 검색, 저장, 비동기 상태를 테스트하기 쉬운 곳에 모읍니다. 나중에 서버가 생기면 [`api.js`](./api.js)의 함수 본문을 `fetch`로 바꾸고, 화면은 거의 그대로 둡니다.

## 파일

| 파일 | 기능 |
|---|---|
| `api.js` | 가짜 백엔드. `login`, `listPosts`, `getPost`, `createPost`, `updatePost`, `deletePost`, `resetDb`. 지연 약 150ms(`config.latency`), `AbortSignal`, `ApiError`. localStorage 키 `board-posts`. 시드 글 12개. 비로그인 401, 작성자가 아니면 403, 없는 글 404. 계정 hong·kim, 비밀번호 1234 |
| `auth.svelte.js` | `AuthStore` 싱글톤 `auth`. `user`를 `board-user`에서 복원, `isLoggedIn`, `login`, `logout` |
| `toast.svelte.js` | `toasts`, `notify(message, type, duration)`, `dismiss`. 기본 2.5초. `untrack`으로 push가 추적을 타지 않게 함 |
| `resource.svelte.js` | `createResource`. 새 요청 중에도 이전 `data`를 유지하고 cleanup에서 `abort` |
| `storage.js` | `readJson(key, fallback)`, `writeJson`, `removeKey`. 깨진 JSON은 fallback |
| `text.js` | `splitByQuery`는 대소문자를 무시하고 검색어 조각에 match를 붙임. 정규식 특수문자도 글자로 찾음. `formatDate`는 ISO를 `2026. 10. 19.` 형태로 |
| `redirect.js` | `safeRedirect`. 앱 안 절대 경로만 허용. `https://`, `//호스트`, `javascript:`, 상대 경로는 `/` |
