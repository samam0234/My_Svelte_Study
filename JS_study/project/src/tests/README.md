# tests — 게시판 테스트 (JS)

`npm test`가 실행합니다. [studyFinal.md](../../../../studyFinal.md)는 이 묶음을 50개로 적습니다. 설정은 `project/vite.config.js`입니다.

- 저장소 전체: [README.md](../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- studyFinal 문서: [studyFinal.md](../../../../studyFinal.md)

## 목적

권한, 주소, 폼, 화면 흐름이 회귀하지 않게 합니다. `auth`와 `toasts`는 모듈 싱글톤이라 `localStorage.clear()`만으로는 다음 테스트가 격리되지 않습니다. 통합 테스트는 `afterEach`에서 로그아웃하고 토스트를 비우고, 해시 변경이 처리된 뒤 다음 테스트로 넘어갑니다.

## 파일

| 파일 | 기능 |
|---|---|
| `setup.js` | jest-dom, jsdom에 없는 브라우저 API, 테스트 사이의 저장소·해시 정리 |
| `lib.test.js` | `splitByQuery`(대소문자, 여러 번, 특수문자), `formatDate`, `safeRedirect`의 악성 값 |
| `api.test.js` | 로그인 401, 검색과 페이지 보정, 조회수, 작성·수정·삭제 401/403/404, 깨진 저장 데이터 복구 |
| `auth.svelte.test.js` | 로그인 성공·실패·로그아웃, 모듈을 다시 불러도 로그인 유지 |
| `PostForm.test.js` | 초기값, blur 후 오류, 검증 실패 시 미전송, 공백 정리, 중복 제출 방지, 서버 오류 |
| `App.test.js` | 목록→검색→페이지→상세, 가드와 redirect 복귀, 로그인 실패, 작성→상세→삭제, 수정, 타인 글 보호, 404 |
