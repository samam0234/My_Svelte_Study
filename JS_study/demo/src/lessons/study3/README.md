# study3 — props · 콜백 · `bind:`

JavaScript 실습 앱의 study3 화면입니다. TypeScript 같은 폴더는 [`TS_study/demo/src/lessons/study3`](../../../../../TS_study/demo/src/lessons/study3/README.md)입니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study3 문서: [study3.md](../../../../../study3.md)

## 목적

컴포넌트를 나누고, 부모와 자식이 값을 주고받게 합니다. 자식이 부모에게 알릴 때는 콜백 prop을 씁니다.

demo 앱 목차에서 이 진도를 고르면 `Lesson.svelte`가 오른쪽에 그려지고, 주소는 `?lesson=study3`가 됩니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 예제를 한 화면에 배치 |
| `UserCard.svelte` | 이름·레벨 등 props와 기본값으로 카드를 그림 |
| `Stepper.svelte` | 현재 값 prop과 증가·감소 콜백. 최솟값·최댓값이면 버튼을 비활성화 |
| `Rating.svelte` | `$bindable` 점수를 부모가 `bind:`로 연결 |
| `BindForm.svelte` | `bind:value` 등으로 입력과 상태를 양방향으로 연결 |

## 테스트

컴포넌트 테스트는 [tests/Stepper.test.js](../../tests/README.md)입니다.
