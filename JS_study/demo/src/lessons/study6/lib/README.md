# study6/lib

study6 화면이 공유하는 상태 모듈입니다. 컴포넌트 마크업은 상위 폴더에 있습니다.

- 저장소 전체: [README.md](../../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study6 문서: [study6.md](../../../../../../study6.md)

## 목적

상태를 컴포넌트 밖으로 꺼내, 트리에서 멀리 떨어진 화면도 같은 값을 읽게 합니다.

## 파일

| 파일 | 기능 |
|---|---|
| `counter.svelte.js` | 모듈 싱글톤 `counter`와, 인스턴스를 따로 만드는 `createCounter` |
| `cart.svelte.js` | `$state` 필드를 가진 `Cart` 클래스와 공유 인스턴스 `cart`. 새로고침 후 복원 |
| `theme.svelte.js` | `setContext` / `getContext` 래퍼 `provideTheme`, `useTheme`. 키는 Symbol. 저장은 `persisted` |
| `persisted.svelte.js` | localStorage와 `$state`를 잇는 `persisted(key, initial)`. 기본 테마는 light |
| `notify.js` | `writable` 메시지, `derived` 개수, `notify` / `dismiss` / `clearMessages`. 룬을 쓰지 않아 일반 확장자 |

`useTheme()`은 `ThemeProvider`가 초기화되며 `provideTheme()`을 호출한 트리 안에서만 쓸 수 있습니다.
