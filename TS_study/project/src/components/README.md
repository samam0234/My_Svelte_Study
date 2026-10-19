# components

게시판에서 재사용하는 화면 조각입니다. 데이터가 어디서 왔는지는 모르고, props와 콜백만 받습니다.

- 저장소 전체: [README.md](../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- studyFinal 문서: [studyFinal.md](../../../../studyFinal.md)

## 목적

라우트 파일이 길어지지 않게 헤더, 검색, 목록, 페이지 번호, 폼, 알림을 분리합니다. study5의 snippet 대신 이 규모에서는 props로 충분합니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Header.svelte` | 목록·글쓰기 링크, 현재 메뉴 강조, 로그인한 이름, 로그아웃 |
| `SearchBar.svelte` | 치는 중인 `draft`와 주소에 반영된 검색어를 분리. 제출 시 `onsearch`. 검색은 1페이지부터 |
| `PostList.svelte` | 제목 링크, 작성자, 날짜, 조회수. `splitByQuery`로 검색어만 `<mark>`. `{@html}`을 쓰지 않음 |
| `Pagination.svelte` | `hrefFor(page)`로 주소를 만들고 현재 페이지를 표시 |
| `PostForm.svelte` | 글쓰기와 수정이 공유. `bind`, blur 이후 오류, 제출 시 전체 오류, 공백 정리, 전송 중 잠금, 서버 오류 `role="alert"`, 입력 유지. `onsubmit`은 부모의 async 함수 |
| `Toast.svelte` | `toasts`를 구독. `in:fly`, `out:fly`, `animate:flip`. 영역 이름은 `aria-label="알림"` |
