# study7 — 라우팅

주소가 화면을 고르게 합니다. 같은 페이지 컴포넌트를 직접 만든 해시 라우터와 `svelte-spa-router`가 같이 씁니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study7 문서: [study7.md](../../../../../study7.md)

JavaScript 같은 폴더: [`JS_study/demo/src/lessons/study7`](../../../../../JS_study/demo/src/lessons/study7/README.md)

## 목적

SPA에서 새로고침 없이 화면을 바꾸고, 로그인하지 않은 사용자를 `/admin`에서 막는 방법을 두 가지로 비교합니다. 게시판(`project/`)은 이 중 라이브러리 방식을 씁니다.

## 이 폴더의 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 직접 만든 라우터 데모와 라이브러리 데모를 전환 |
| `data.ts` | 사용자 세 명. 홍길동(관리자), 이영희(편집자), 박철수(일반) |
| `auth.svelte.ts` | 이 진도의 로그인. `login(name)`, `logout()`. `$state` 객체. 게시판의 AuthStore보다 단순 |

## 하위 폴더

| 폴더 | 기능 |
|---|---|
| [custom](./custom/README.md) | 해시 라우터를 약 한 파일로 직접 구현. 가드와 로그아웃이 겹칠 때의 경쟁 상태 포함 |
| [library](./library/README.md) | 같은 페이지를 `svelte-spa-router`로 조립 |
| [pages](./pages/README.md) | 두 라우터가 공유하는 페이지 |

## 테스트

[tests/matchPath.test.ts](../../tests/README.md)는 패턴 매칭 순수 함수를, [tests/router.test.ts](../../tests/README.md)는 해시 이동, 파라미터, 404, 가드, 로그아웃 경쟁 상태를 확인합니다.
