# study9 — transition · action · 생명주기

등장과 퇴장, 리스트 재배치, DOM에 붙는 재사용 로직, 컴포넌트가 생기고 사라지는 순서를 다룹니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study9 문서: [study9.md](../../../../../study9.md)

TypeScript 같은 폴더: [`TS_study/demo/src/lessons/study9`](../../../../../TS_study/demo/src/lessons/study9/README.md)

## 목적

CSS 애니메이션 라이브러리 없이 Svelte 지시어로 움직임을 넣습니다. 게시판 토스트의 `in:fly`, `out:fly`, `animate:flip`은 여기서 온 것입니다.

## 화면 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 데모를 한 화면에 배치 |
| `TransitionDemo.svelte` | `fade`, `fly`, `slide`, `scale`과 한 글자씩 나타나는 커스텀 `typewriter` |
| `FlipList.svelte` | 순서나 필터가 바뀔 때 `animate:flip`으로 항목이 이동 |
| `MotionDemo.svelte` | `Tween`과 `Spring`으로 숫자가 목표까지 변함. `prefersReducedMotion`이면 애니메이션을 끔 |
| `LifecycleDemo.svelte` | 자식을 붙였다 뗄 때 mount, effect, destroy 순서를 로그로 표시 |
| `LifeChild.svelte` | 마운트와 해제 시점에 `log()`를 호출하는 자식 |
| `ActionDemo.svelte` | 바깥 클릭, 자동 포커스, 길게 누르기를 입력과 버튼에 적용 |

## 테스트

[tests/actions.test.js](../../tests/README.md)가 액션의 `update`, `destroy`와 리스너 해제를 확인합니다.

DOM 헬퍼와 로그 저장소는 [lib/README.md](./lib/README.md)에 있습니다.
