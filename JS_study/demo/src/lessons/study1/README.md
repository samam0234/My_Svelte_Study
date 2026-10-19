# study1 — 첫 컴포넌트와 템플릿

JavaScript 실습 앱의 study1 화면입니다. TypeScript 같은 폴더는 [`TS_study/demo/src/lessons/study1`](../../../../../TS_study/demo/src/lessons/study1/README.md)입니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study1 문서: [study1.md](../../../../../study1.md)

## 목적

반응형 룬을 쓰기 전에, 값과 JS 표현식을 마크업에 넣는 방법을 보여 줍니다. 일반 변수라서 값을 나중에 바꿔도 화면은 따라가지 않습니다. 그 차이는 study2에서 다룹니다.

demo 앱 목차에서 이 진도를 고르면 `Lesson.svelte`가 오른쪽에 그려지고, 주소는 `?lesson=study1`가 됩니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 보간 `{ }` , 삼항·함수 호출, `img {src}` 속성, 조건부 클래스, `{@html}`이 HTML을 그대로 넣는다는 예시 |
| `Greeting.svelte` | 부모가 내려 준 `name`으로 인사말을 그리는 자식. 스타일은 이 컴포넌트 안으로 제한. props 자세한 설명은 study3 |

## 테스트

전용 테스트 파일은 없습니다. [tests](../../tests/README.md)의 스모크 테스트가 이 `Lesson` 마운트를 확인합니다.
