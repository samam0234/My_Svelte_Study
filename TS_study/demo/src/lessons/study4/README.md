# study4 — 조건 렌더링 · 리스트

TypeScript 실습 앱의 study4 화면입니다. JavaScript 같은 폴더는 [`JS_study/demo/src/lessons/study4`](../../../../../JS_study/demo/src/lessons/study4/README.md)입니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study4 문서: [study4.md](../../../../../study4.md)

## 목적

조건과 배열로 화면을 만들고, `{#each}`의 key와 파생 목록까지 갑니다.

demo 앱 목차에서 이 진도를 고르면 `Lesson.svelte`가 오른쪽에 그려지고, 주소는 `?lesson=study4`가 됩니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 예제를 한 화면에 배치 |
| `Conditional.svelte` | `{#if}` / `{:else if}` / `{:else}`로 상태별 문구와 버튼 |
| `KeyDemo.svelte` | key가 있을 때와 없을 때 입력 중이던 DOM이 어떻게 따라붙는지 |
| `TodoList.svelte` | 할 일 추가, 완료 토글, 삭제, 필터, 빈 목록 문구 |
| `SearchList.svelte` | 검색·필터·정렬을 `$derived` 배열로 계산해 목록을 그림 |

## 테스트

컴포넌트 테스트는 [tests/TodoList.test.ts](../../tests/README.md)입니다.
