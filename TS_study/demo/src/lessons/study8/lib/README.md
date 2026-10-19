# study8/lib

study8의 API 계층과 비동기 상태 헬퍼입니다.

- 저장소 전체: [README.md](../../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study8 문서: [study8.md](../../../../../../study8.md)

## 목적

네트워크 모양(Promise, 지연, 실패, 취소)을 화면 밖에서 맞춰 둡니다. 화면은 `data` / `loading` / `error`만 보면 됩니다.

## 파일

| 파일 | 기능 |
|---|---|
| `api.ts` | `listPosts`, `getPost`, `createPost`, `deletePost`. `ApiError`, `signal`, 일부러 실패시키는 `fail` 옵션. JSONPlaceholder를 부름 |
| `resource.svelte.ts` | `createResource(fetcher)`. `load`와 `abort`. 새 요청이 이전 응답을 덮어쓰지 않게 취소 |
