# study6 — 공유 상태

여러 컴포넌트가 같은 값을 보게 합니다. props를 단계마다 내려 주지 않습니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study6 문서: [study6.md](../../../../../study6.md)

JavaScript 같은 폴더: [`JS_study/demo/src/lessons/study6`](../../../../../JS_study/demo/src/lessons/study6/README.md)

## 목적

컴포넌트 밖 파일에서도 룬을 쓰려면 확장자가 `.svelte.ts`여야 합니다. `svelte/store`만 쓰는 파일은 일반 `.ts`입니다. 화면 파일과 [lib](./lib/README.md)의 상태 모듈이 나뉩니다.

## 화면 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 데모를 한 화면에 배치 |
| `CounterDemo.svelte` | 모듈 `counter`를 여러 자리에서 증가·초기화 |
| `CartDemo.svelte` | `Cart` 클래스의 담기, 수량, 합계, localStorage 유지 |
| `ThemeProvider.svelte` | `provideTheme()`으로 테마 context를 연다 |
| `ThemeToggle.svelte` | 테마를 light와 dark로 바꿈 |
| `ThemeLabel.svelte` | `useTheme()`으로 현재 테마 문구를 표시 |
| `ContextDemo.svelte` | Provider 아래 토글과 라벨이 같은 테마를 봄 |
| `StoreDemo.svelte` | `writable` / `derived`와 `$store`로 알림 목록 |
| `SetDemo.svelte` | `SvelteSet`으로 태그 선택을 토글. 일반 `Set`은 반응형이 아님 |

## 테스트

[tests/cart.svelte.test.ts](../../tests/README.md)가 `Cart`의 수량, 합계, localStorage 복원을 확인합니다.

상태 모듈의 함수 설명은 [lib/README.md](./lib/README.md)에 있습니다.
