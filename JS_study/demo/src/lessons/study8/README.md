# study8 — 폼과 API

로딩, 실패, 취소, 폼 검증, 낙관적 업데이트를 화면에 연결합니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study8 문서: [study8.md](../../../../../study8.md)

TypeScript 같은 폴더: [`TS_study/demo/src/lessons/study8`](../../../../../TS_study/demo/src/lessons/study8/README.md)

## 목적

화면이 `fetch`를 직접 흩뿌리지 않고 [lib/api.js](./lib/README.md)만 부르게 합니다. 호출 대상은 JSONPlaceholder이고, 테스트는 `src/tests/fakeApi.js`가 `fetch`를 대체합니다. 게시판의 `createResource`와 `PostForm`은 이 진도의 패턴을 가져갑니다.

## 화면 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 데모를 한 화면에 배치 |
| `AwaitDemo.svelte` | `{#await}`의 대기, 성공, 실패 |
| `ResourceDemo.svelte` | 필터가 바뀌면 다시 요청하고 이전 요청은 `AbortSignal`로 취소 |
| `PostForm.svelte` | 검증을 `$derived`로 계산. blur 이후 오류, 전송 중 잠금, 실패 시 입력 유지 |
| `PostManager.svelte` | 목록, 작성, 삭제. 먼저 화면을 고치고 실패하면 롤백 |

## 테스트

[tests/resource.svelte.test.js](../../tests/README.md)는 마지막 응답만 반영하는지, [tests/PostManager.test.js](../../tests/README.md)는 검증과 낙관적 업데이트, 롤백을 확인합니다.

API 함수는 [lib/README.md](./lib/README.md)에 있습니다.
