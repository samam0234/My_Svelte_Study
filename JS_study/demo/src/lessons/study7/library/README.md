# study7/library — svelte-spa-router

직접 만든 라우터와 같은 페이지를 라이브러리로 연결합니다.

- 저장소 전체: [README.md](../../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study7 문서: [study7.md](../../../../../../study7.md)

## 목적

`svelte-spa-router`의 `Router`, `wrap({ conditions })`, `use:link`, `use:active`가 [custom](../custom/README.md)에서 손으로 만든 기능과 같은 자리를 맡는다는 것을 보여 줍니다. 게시판 `App.svelte`는 이 패턴을 그대로 확장합니다.

## 파일

| 파일 | 기능 |
|---|---|
| `LibraryRouterDemo.svelte` | `pages/`를 라우트 표에 등록. 보호 라우트는 `wrap`과 로그인 조건 |
