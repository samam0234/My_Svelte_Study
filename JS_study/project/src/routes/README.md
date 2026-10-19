# routes

주소 하나당 페이지 하나입니다. 데이터를 불러와 [components](../components/README.md)를 조립합니다.

- 저장소 전체: [README.md](../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- studyFinal 문서: [studyFinal.md](../../../../studyFinal.md)

## 목적

`lib`의 `createResource`와 `api`를 라우트에서만 연결합니다. 목록의 `q`와 `page`는 쿼리에서 `$derived`로 읽고, `$effect`가 바뀔 때마다 `listPosts`를 호출한 뒤 cleanup에서 `abort`합니다. 빈 검색과 1페이지는 쿼리에서 빼서 `#/`를 유지합니다.

라우트 표 자체는 [`App.svelte`](../App.svelte)에 있습니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Home.svelte` | 검색바, 목록, 페이지. 로딩 중에는 이전 목록을 흐리게 두고 `aria-busy` |
| `PostDetail.svelte` | `getPost`. 작성자이면 수정 링크와 삭제 확인. 본문은 이스케이프되는 `{ }` 출력. 다른 글로 가면 확인 상태가 닫힘 |
| `PostWrite.svelte` | 가드 통과 후 `PostForm` → `createPost` → 새 글 상세 |
| `PostEdit.svelte` | 글을 불러온 다음에 폼을 만들어 초기값이 기존 글이 되게 함. `updatePost` |
| `Login.svelte` | `auth.login`. 실패 문구. 성공 시 `safeRedirect` 결과로 `replace`해서 로그인 화면이 히스토리에 남지 않음 |
| `NotFound.svelte` | 없는 주소 안내와 목록 링크 |

화면에서 수정·삭제 버튼을 숨기는 것은 편의를 위한 것입니다. 다른 작성자의 글을 주소로 직접 열거나 요청을 보내도 [`api.js`](../lib/api.js)가 403을 반환합니다.
