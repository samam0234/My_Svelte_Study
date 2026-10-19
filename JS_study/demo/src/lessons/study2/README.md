# study2 — 반응형 `$state` · `$derived` · `$effect`

JavaScript 실습 앱의 study2 화면입니다. TypeScript 같은 폴더는 [`TS_study/demo/src/lessons/study2`](../../../../../TS_study/demo/src/lessons/study2/README.md)입니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study2 문서: [study2.md](../../../../../study2.md)

## 목적

일반 `let`과 룬의 차이를 네 개의 예제로 나눕니다. 상태가 바뀌면 그 상태를 읽는 DOM만 갱신됩니다.

demo 앱 목차에서 이 진도를 고르면 `Lesson.svelte`가 오른쪽에 그려지고, 주소는 `?lesson=study2`가 됩니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 네 예제를 한 화면에 배치 |
| `Counter.svelte` | 클릭할 때마다 `$state` 숫자가 화면과 함께 증가 |
| `DeepState.svelte` | 객체 필드와 배열 항목을 직접 고쳐도 화면이 따라가는 깊은 반응형 |
| `Derived.svelte` | 입력에서 `$derived`로 계산. 파생 값에 직접 대입하지 않음 |
| `Effect.svelte` | 초시계 `$effect`와 타이머 cleanup, `document.title` 동기화, 개발용 `$inspect` |

## 테스트

컴포넌트 테스트는 [tests/Counter.test.js](../../tests/README.md)입니다.
