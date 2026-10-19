# study5 — 컴포넌트 합성

JavaScript 실습 앱의 study5 화면입니다. TypeScript 같은 폴더는 [`TS_study/demo/src/lessons/study5`](../../../../../TS_study/demo/src/lessons/study5/README.md)입니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study5 문서: [study5.md](../../../../../study5.md)

## 목적

내용은 부모가 채우고, 껍데기와 동작은 자식이 맡는 컴포넌트를 만듭니다. Svelte 5에서는 `children`과 snippet을 씁니다.

demo 앱 목차에서 이 진도를 고르면 `Lesson.svelte`가 오른쪽에 그려지고, 주소는 `?lesson=study5`가 됩니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 카드, 버튼, 모달, 탭, 데이터 리스트를 조합 |
| `Card.svelte` | 기본 `children`과 header/footer snippet |
| `Button.svelte` | 공통 버튼. 나머지 속성과 이벤트는 `...rest`로 전달 |
| `Modal.svelte` | `$bindable` 열림 상태, 본문과 액션 snippet |
| `Tabs.svelte` | 선택된 탭은 이 컴포넌트의 `$state`. 본문은 부모 snippet |
| `DataList.svelte` | 목록 데이터는 부모가 주고, 한 줄의 모양은 snippet 파라미터가 그림 |

## 테스트

전용 테스트 파일은 없습니다. 스모크 테스트가 `Lesson` 마운트를 확인합니다.
